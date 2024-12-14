// import { db } from "@/lib/db";
// import React from "react";
// import { auth } from "../../../../auth";
// import ClientsData from "@/components/ClientsData";

// const ClientsPage = async () => {
//   const session = await auth();
//   const users = await db.user.findMany({
//     where: { NOT: { email: session?.user?.email! } },
//   });
//   return <ClientsData data={users} />;
// };

// export default ClientsPage;

import React from 'react';
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: 'black',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
    },
    content: {
      display: 'flex',
      alignItems: 'center',
    },
    errorCode: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginRight: '20px',
    },
    errorMessage: {
      fontSize: '16px',
    },
    separator: {
      width: '1px',
      height: '40px',
      backgroundColor: 'white',
      margin: '0 20px',
    },
  };

export default function clients() {
    return (
        <div style={styles.container}>
        <div style={styles.content}>
          <span style={styles.errorCode}>404</span>
          <div style={styles.separator}></div>
          <span style={styles.errorMessage}>This page could not be found.</span>
        </div>
      </div>
    );
  }
