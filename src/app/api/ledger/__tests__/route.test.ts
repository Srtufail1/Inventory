import { NextRequest } from "next/server";
import { db } from "@/lib/db";

let GET: (request: NextRequest) => Promise<Response>;

const TEST_CUSTOMER = "Sample Customer A";

const EXPECTED_INUMBERS = {
  first: "4361",
  second: "4438",
  third: "6298",
  fourth: "6331",
} as const;

describe("GET /api/ledger integration", () => {
  beforeAll(async () => {
    // Reset module cache so Prisma reads correct DATABASE_URL
    vi.resetModules();

    const routeModule = await import("../route");
    GET = routeModule.GET;
  });

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-16T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const getLedgerResponse = async (url?: string) => {
    const request = new NextRequest(
      url ??
        `http://test/api/ledger?customer=${encodeURIComponent(
          TEST_CUSTOMER
        )}`
    );
    const response = await GET(request);
    const body = await response.json().catch(() => null);
    return { response, body };
  };

  //happy-path tests

  it("U1: validates generateLedgerData output through ledgerDataSets", async () => {
    const { response, body } = await getLedgerResponse();
    expect(response.status).toBe(200);

    const ledgerByInumber = Object.fromEntries(
      body.ledgerDataSets.map((row: any) => [row.inumber, row.ledgerData])
    );

    expect(ledgerByInumber[EXPECTED_INUMBERS.first]).toHaveLength(6);

    expect(
      ledgerByInumber[EXPECTED_INUMBERS.first][5]
    ).toMatchObject({
      dates: "20.08.25 - 20.09.25",
      outQuantity: 80,
      quantity: "80",
      nextPeriodQuantity: "0",
      amount: 2000,
    });
  });

  it("U2: validates generateLaborTable output through laborTable", async () => {
    const { response, body } = await getLedgerResponse();
    expect(response.status).toBe(200);

    const laborByInumber = Object.fromEntries(
      body.laborTable.map((row: any) => [row.inumber, row])
    );

    expect(laborByInumber[EXPECTED_INUMBERS.first]).toMatchObject({
      addDate: "20.03.25",
      dueDate: "20.04.25",
      labourAmount: 800,
    });

    expect(laborByInumber[EXPECTED_INUMBERS.fourth]).toMatchObject({
      addDate: "29.01.26",
      dueDate: "28.02.26",
      labourAmount: 4800,
    });
  });

  it("U3: validates customer details remaining quantity", async () => {
    const { response, body } = await getLedgerResponse();
    expect(response.status).toBe(200);

    const customerByInumber = Object.fromEntries(
      body.customerDetails.map((row: any) => [row.inumber, row])
    );

    expect(
      customerByInumber[EXPECTED_INUMBERS.first].remaining_quantity
    ).toBe(0);

    expect(
      customerByInumber[EXPECTED_INUMBERS.second].remaining_quantity
    ).toBe(0);

    expect(
      customerByInumber[EXPECTED_INUMBERS.third].remaining_quantity
    ).toBe(10);

    expect(
      customerByInumber[EXPECTED_INUMBERS.fourth].remaining_quantity
    ).toBe(0);
  });

  it("I1: returns full shape and key calculations", async () => {
    const { response, body } = await getLedgerResponse();

    expect(response.status).toBe(200);

    expect(body).toEqual(
      expect.objectContaining({
        ledgerDataSets: expect.any(Array),
        customerDetails: expect.any(Array),
        laborTable: expect.any(Array),
      })
    );

    expect(body.ledgerDataSets.length).toBeGreaterThanOrEqual(4);
    expect(body.customerDetails.length).toBeGreaterThanOrEqual(4);
    expect(body.laborTable.length).toBeGreaterThanOrEqual(4);
  });

  //Edge & error tests

  it("returns 400 if customer is missing", async () => {
    const { response } = await getLedgerResponse(
      "http://test/api/ledger"
    );

    expect(response.status).toBe(400);
  });

  it("returns 404 if no inward data found", async () => {
    const { response } = await getLedgerResponse(
      "http://test/api/ledger?customer=NonExistentCustomer"
    );

    expect(response.status).toBe(404);
  });

  it("filters correctly by inward number", async () => {
    const { response, body } = await getLedgerResponse(
      `http://test/api/ledger?customer=${encodeURIComponent(
        TEST_CUSTOMER
      )}&inward=${EXPECTED_INUMBERS.first}`
    );

    expect(response.status).toBe(200);

    expect(body.ledgerDataSets).toHaveLength(1);
    expect(body.ledgerDataSets[0].inumber).toBe(
      EXPECTED_INUMBERS.first
    );
  });

  it("returns 500 on database failure", async () => {
    vi.spyOn(db.inward, "findMany").mockRejectedValueOnce(
      new Error("DB failure")
    );

    const { response } = await getLedgerResponse();

    expect(response.status).toBe(500);
  });
});