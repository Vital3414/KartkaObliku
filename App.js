import React, { useState } from "react";

const App = () => {
  const [cardNumber, setCardNumber] = useState("54");
  const [cardDate, setCardDate] = useState("2023-10-04");
  const [responsible, setResponsible] = useState("Токман В.М.");
  const [storage, setStorage] = useState("Кравець О.О.");
  const [rows, setRows] = useState([
    { name: "Системний блок", quantity: 1, invNumber: "", price: "" },
    { name: "Монітор", quantity: 1, invNumber: "", price: "" },
    { name: "Мишка", quantity: 1, invNumber: "", price: "" },
    { name: "Клавіатура", quantity: 1, invNumber: "", price: "" },
  ]);

  const addRow = () => {
    setRows([...rows, { name: "", quantity: 1, invNumber: "", price: "" }]);
  };

  const updateRow = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const generateTextFile = () => {
    let content = `ГОСТОМЕЛЬСЬКА СЕЛИЩНА ВІЙСЬКОВА АДМІНІСТРАЦІЯ\n\n`;
    content += `Картка обліку організаційної техніки № ${cardNumber}\n`;
    content += `від ${cardDate}\n`;
    content += `Матеріально відповідальна особа: ${responsible}\n`;
    content += `На зберіганні у: ${storage}\n\n`;
    content += `№\tНайменування\tКількість\tІнв. номер\tЦіна\n`;

    rows.forEach((row, index) => {
      content += `${index + 1}\t${row.name}\t${row.quantity}\t${row.invNumber}\t${row.price}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `kartka_${cardNumber}.txt`;
    link.click();
  };

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
      <h2>Картка обліку організаційної техніки</h2>
      <label>Номер картки: <input type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} /></label><br /><br />
      <label>Дата: <input type="date" value={cardDate} onChange={e => setCardDate(e.target.value)} /></label><br /><br />
      <label>Матеріально відповідальна особа: <input type="text" value={responsible} onChange={e => setResponsible(e.target.value)} /></label><br /><br />
      <label>На зберіганні у: <input type="text" value={storage} onChange={e => setStorage(e.target.value)} /></label><br /><br />

      <h3>Оргтехніка</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc" }}>№</th>
            <th style={{ border: "1px solid #ccc" }}>Найменування</th>
            <th style={{ border: "1px solid #ccc" }}>Кількість</th>
            <th style={{ border: "1px solid #ccc" }}>Інв. номер</th>
            <th style={{ border: "1px solid #ccc" }}>Ціна (грн)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ccc", textAlign: "center" }}>{index + 1}</td>
              <td style={{ border: "1px solid #ccc" }}><input type="text" value={row.name} onChange={e => updateRow(index, 'name', e.target.value)} /></td>
              <td style={{ border: "1px solid #ccc" }}><input type="number" value={row.quantity} onChange={e => updateRow(index, 'quantity', e.target.value)} /></td>
              <td style={{ border: "1px solid #ccc" }}><input type="text" value={row.invNumber} onChange={e => updateRow(index, 'invNumber', e.target.value)} /></td>
              <td style={{ border: "1px solid #ccc" }}><input type="number" value={row.price} onChange={e => updateRow(index, 'price', e.target.value)} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={addRow}>Додати рядок</button>
      <button onClick={generateTextFile} style={{ marginLeft: "10px" }}>Згенерувати бланк</button>
      <br /><br />
      <input type="file" accept="image/*,application/pdf" />
    </div>
  );
};

export default App;
