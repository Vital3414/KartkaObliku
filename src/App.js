import React, { useState, useEffect } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

const API_URL = "https://nodejs-hw-mongodb-y5ne.onrender.com";

const App = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardDate, setCardDate] = useState("");
  const [responsible, setResponsible] = useState("Токман В.М.");
  const [storage, setStorage] = useState("");
  const [rows, setRows] = useState([{ name: "", quantity: 0, invNumber: "", price: "" }]);

  const [allKartky, setAllKartky] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [scanFile, setScanFile] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    fetchAllCards();
  }, []);

  const addRow = () => setRows([...rows, { name: "", quantity: 0, invNumber: "", price: "" }]);
  const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));
  const updateRow = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const saveToServer = async () => {
    if (!cardNumber || !cardDate) {
      alert("Заповніть номер картки і дату!");
      return;
    }
    const newCard = { cardNumber, cardDate, responsible, storage, rows };
    const res = await fetch(`${API_URL}/api/kartky`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCard),
    });

    if (res.ok) {
      const createdCard = await res.json();
      setAllKartky(prev => [...prev, createdCard]);
      setCardNumber("");
      setCardDate("");
      setResponsible("Токман В.М.");
      setStorage("");
      setRows([{ name: "", quantity: 0, invNumber: "", price: "" }]);
      alert("Картку збережено!");
    } else {
      alert("Помилка збереження картки.");
    }
  };

  const fetchAllCards = async () => {
    const res = await fetch(`${API_URL}/api/kartky`);
    const data = await res.json();
    setAllKartky(data);
  };

  const openModal = (card) => {
    setSelectedCard(card);
    setScanFile(null);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setSelectedCard(null);
    setModalIsOpen(false);
    setScanFile(null);
  };

  const uploadScan = async () => {
    if (!scanFile) {
      alert("Оберіть файл для завантаження.");
      return;
    }
    if (!selectedCard || !selectedCard._id) {
      alert("Не вибрано картку.");
      return;
    }

    const formData = new FormData();
    formData.append("scan", scanFile);

    const res = await fetch(`${API_URL}/api/kartky/${selectedCard._id}/scan`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const updated = await res.json();
      alert("Сканкопію завантажено!");
      fetchAllCards();
      setSelectedCard(updated);
      setScanFile(null);
    } else {
      alert("Помилка завантаження.");
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}.${m}.${y}`;
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>Нова картка</h2>
      <input placeholder="Номер" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
      <input type="date" value={cardDate} onChange={(e) => setCardDate(e.target.value)} />
      <input placeholder="Відповідальна особа" value={responsible} onChange={(e) => setResponsible(e.target.value)} />
      <input placeholder="На зберіганні у" value={storage} onChange={(e) => setStorage(e.target.value)} />

      <h3>Оргтехніка</h3>
      {rows.map((row, i) => (
        <div key={i} style={{ display: "flex", gap: 5, marginBottom: 5 }}>
          <input placeholder="Назва" value={row.name} onChange={(e) => updateRow(i, "name", e.target.value)} />
          <input type="number" value={row.quantity} onChange={(e) => updateRow(i, "quantity", e.target.value)} />
          <input placeholder="Інв. №" value={row.invNumber} onChange={(e) => updateRow(i, "invNumber", e.target.value)} />
          <input placeholder="Ціна" value={row.price} onChange={(e) => updateRow(i, "price", e.target.value)} />
          <button onClick={() => removeRow(i)}>❌</button>
        </div>
      ))}

      <br />
      <button onClick={addRow}>Додати рядок</button>
      <button onClick={saveToServer} style={{ marginLeft: 10 }}>Зберегти картку</button>

      <hr />
      <h2>Усі збережені картки</h2>
      <ul>
        {allKartky.map((k, i) => (
          <li key={i}>
            №{k.cardNumber} від {formatDate(k.cardDate)} — {k.responsible}{" "}
            <button onClick={() => openModal(k)}>Переглянути</button>
          </li>
        ))}
      </ul>

      {/* Модальне вікно */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Деталі картки"
        style={{
          content: { width: "80%", margin: "auto", padding: 20, height: "80%" },
        }}
      >
        {selectedCard && (
          <div>
            <h2>Картка №{selectedCard.cardNumber}</h2>
            <p><strong>Дата:</strong> {formatDate(selectedCard.cardDate)}</p>
            <p><strong>Відповідальна особа:</strong> {selectedCard.responsible}</p>
            <p><strong>На зберіганні:</strong> {selectedCard.storage}</p>

            <h3>Оргтехніка</h3>
            <table border="1" cellPadding="5" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Назва</th>
                  <th>К-сть</th>
                  <th>Інв. №</th>
                  <th>Ціна</th>
                </tr>
              </thead>
              <tbody>
                {selectedCard.rows?.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{r.name}</td>
                    <td>{r.quantity}</td>
                    <td>{r.invNumber}</td>
                    <td>{r.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 20 }}>
              <h4>Сканкопія з підписом:</h4>
              {selectedCard.scanFile ? (
                <>
                  <iframe
                    src={`${API_URL}/api/kartky/scan/${selectedCard.scanFile}`}
                    width="100%"
                    height="400px"
                    title="PDF"
                  />
                  <br />
                  <button onClick={() => window.open(`${API_URL}/api/kartky/scan/${selectedCard.scanFile}`, "_blank")}>
                    🔽 Відкрити / Друк
                  </button>
                </>
              ) : (
                <p>Сканкопія відсутня</p>
              )}

              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setScanFile(e.target.files[0])}
                style={{ marginTop: 10 }}
              />
              <br />
              <button onClick={uploadScan} style={{ marginTop: 10 }}>
                Завантажити сканкопію
              </button>
            </div>

            <br />
            <button onClick={closeModal}>Закрити</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default App;
