import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  PageBreak,
  Column,
} from "docx";

Modal.setAppElement("#root");

const API_URL = "https://nodejs-hw-mongodb-y5ne.onrender.com";

// Функція створення таблиці з оргтехнікою
const createTable = (rows) => {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "№", style: "normalText" })] }),
          new TableCell({ children: [new Paragraph({ text: "Назва", style: "normalText" })] }),
          new TableCell({ children: [new Paragraph({ text: "К-сть", style: "normalText" })] }),
          new TableCell({ children: [new Paragraph({ text: "Інв. №", style: "normalText" })] }),
          new TableCell({ children: [new Paragraph({ text: "Ціна", style: "normalText" })] }),
        ],
      }),
      ...rows.map((r, i) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: String(i + 1), style: "normalText" })] }),
            new TableCell({ children: [new Paragraph({ text: r.name, style: "normalText" })] }),
            new TableCell({ children: [new Paragraph({ text: String(r.quantity), style: "normalText" })] }),
            new TableCell({ children: [new Paragraph({ text: r.invNumber, style: "normalText" })] }),
            new TableCell({ children: [new Paragraph({ text: r.price, style: "normalText" })] }),
          ],
        })
      ),
    ],
  });
};

const formatDate = (d) => {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}.${m}.${y}`;
};

// Функція для створення Word документа для однієї картки
const createDocumentForCard = (card) => {
  return new Document({
    styles: {
      paragraphStyles: [
        {
          id: "normalText",
          name: "Normal Text",
          basedOn: "Normal",
          next: "Normal",
          run: {
            font: "Times New Roman",
            size: 28, // 14 pt (docx size = points * 2)
          },
        },
      ],
    },
    sections: [
      {
        children: [
          new Paragraph({
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: "ГОСТОМЕЛЬСЬКА СЕЛИЩНА ВІЙСЬКОВА АДМІНІСТРАЦІЯ",
                bold: true,
                font: "Times New Roman",
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `Картка обліку організаційної техніки №${card.cardNumber}`,
                bold: true,
                font: "Times New Roman",
                size: 28,
              }),
            ],
          }),
          new Paragraph({ text: `Від: ${formatDate(card.cardDate)}`, style: "normalText" }),
          new Paragraph({ text: `Матеріально відповідальна особа: ${card.responsible}`, style: "normalText" }),
          new Paragraph({ text: `На зберіганні у: ${card.storage}`, style: "normalText" }),
          new Paragraph({ text: "Оргтехніка:", style: "normalText", spacing: { before: 300, after: 100 } }),
          createTable(card.rows || []),
        ],
      },
    ],
  });
};

const exportAllCardsToWord = async (allKartky) => {
  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: "normalText",
          name: "Normal Text",
          basedOn: "Normal",
          next: "Normal",
          run: {
            font: "Times New Roman",
            size: 28,
          },
        },
      ],
    },
    sections: [],
  });

  allKartky.forEach((card, idx) => {
    doc.addSection({
      children: [
        new Paragraph({
          spacing: { after: 300 },
          children: [
            new TextRun({
              text: "ГОСТОМЕЛЬСЬКА СЕЛИЩНА ВІЙСЬКОВА АДМІНІСТРАЦІЯ",
              bold: true,
              font: "Times New Roman",
              size: 28,
            }),
          ],
        }),
        new Paragraph({
          spacing: { after: 300 },
          children: [
            new TextRun({
              text: `Картка обліку організаційної техніки №${card.cardNumber}`,
              bold: true,
              font: "Times New Roman",
              size: 28,
            }),
          ],
        }),
        new Paragraph({ text: `Від: ${formatDate(card.cardDate)}`, style: "normalText" }),
        new Paragraph({ text: `Матеріально відповідальна особа: ${card.responsible}`, style: "normalText" }),
        new Paragraph({ text: `На зберіганні у: ${card.storage}`, style: "normalText" }),
        new Paragraph({ text: "Оргтехніка:", style: "normalText", spacing: { before: 300, after: 100 } }),
        createTable(card.rows || []),
        idx < allKartky.length - 1 ? new Paragraph({ children: [new PageBreak()] }) : null,
      ].filter(Boolean),
    });
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "kartky_all.docx");
};

const exportSingleCardToWord = async (card) => {
  const doc = createDocumentForCard(card);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `kartka_${card.cardNumber}.docx`);
};

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
      setAllKartky((prev) => [...prev, createdCard]);
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

  const deleteCard = async (id) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цю картку?")) return;

    const res = await fetch(`${API_URL}/api/kartky/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Картку видалено.");
      fetchAllCards();
      closeModal();
    } else {
      alert("Помилка при видаленні.");
    }
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

  return (
    <div style={{ padding: 20, fontFamily: "Arial", gap: "10px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h2>Нова картка</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 250 }}>
          <input
            placeholder="Номер"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
          />
          <input type="date" value={cardDate} onChange={(e) => setCardDate(e.target.value)} />
          <input
            placeholder="Відповідальна особа"
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
          />
          <input placeholder="На зберіганні у" value={storage} onChange={(e) => setStorage(e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h3>Оргтехніка</h3>
        {rows.map((row, i) => (
          <div key={i} style={{ display: "flex", gap: 5, marginBottom: 5 }}>
            <input
              placeholder="Назва"
              value={row.name}
              onChange={(e) => updateRow(i, "name", e.target.value)}
            />
            <input
              type="number"
              value={row.quantity}
              onChange={(e) => updateRow(i, "quantity", e.target.value)}
            />
            <input
              placeholder="Інв. №"
              value={row.invNumber}
              onChange={(e) => updateRow(i, "invNumber", e.target.value)}
            />
            <input
              placeholder="Ціна"
              value={row.price}
              onChange={(e) => updateRow(i, "price", e.target.value)}
            />
            <button onClick={() => removeRow(i)}>❌</button>
          </div>
        ))}
      </div>

      <br />
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center",  gap: 10 }}>
        <button onClick={addRow}>Додати рядок</button>
        <button onClick={saveToServer} style={{ marginLeft: 10 }}>
          Зберегти картку
        </button>
      </div>

      <hr />

      {/* Кнопка експорту всіх карток */}
      {allKartky.length >= 2 && (
        <button
          onClick={() => exportAllCardsToWord(allKartky)}
          style={{
            marginBottom: 20,
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px",
            border: "none",
            cursor: "pointer",
          }}
        >
          📄 Завантажити всі картки у Word
        </button>
      )}

      <h2>Усі збережені картки</h2>
      <ul>
        {allKartky.map((k) => (
          <li key={k._id}>
            №{k.cardNumber} від {formatDate(k.cardDate)} — {k.responsible}{" "}
            <button onClick={() => openModal(k)}>Переглянути</button>
            <button
              onClick={() => exportSingleCardToWord(k)}
              style={{ marginLeft: 5 }}
              title="Завантажити цю картку у Word"
            >
              📄
            </button>
            <button
              onClick={() => deleteCard(k._id)}
              style={{ marginLeft: 5 }}
              title="Видалити картку"
            >
              🗑️
            </button>
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
            <h1>ГОСТОМЕЛЬСЬКА СЕЛИЩНА ВІЙСЬКОВА АДМІНІСТРАЦІЯ</h1>
            <h2>Картка обліку організаційної техніки №{selectedCard.cardNumber}</h2>
            <p>
              <strong>Від:</strong> {formatDate(selectedCard.cardDate)}
            </p>
            <p>
              <strong>Матеріально відповідальна особа:</strong> {selectedCard.responsible}
            </p>
            <p>
              <strong>На зберіганні:</strong> {selectedCard.storage}
            </p>

            <h3>Оргтехніка</h3>
            <table
              border="1"
              cellPadding="5"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
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
                  <button
                    onClick={() =>
                      window.open(
                        `${API_URL}/api/kartky/scan/${selectedCard.scanFile}`,
                        "_blank"
                      )
                    }
                  >
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
