import { Construction } from "lucide-react";
export default function inward() {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#333', fontSize: '24px' }}>Inward Gate Pass</h1>
        <br></br>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Under Construction 
        </p>
        <Construction size={32} color="#007bff" strokeWidth={1.75}/>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
        <button style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Test Button
        </button>
      </div>
    );
  }