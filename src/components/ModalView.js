import React from "react";

const ModalView = ({ card, onClose }) => {
  if (!card) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
    }}>
      <div style={{ background: "#fff", padding: 20, maxWidth: "700px", width: "100%", borderRadius: 8 }}>
        <h2>Картка №{card.cardNumber}</h2>
        <p><strong>Дата:</strong> {card.cardDate}</p>
        <p><strong>Відповідальна особа:</strong> {card.responsible}</p>
        <p><strong>Зберігання:</strong> {card.storage}</p>
        <h4>Оргтехніка:</h4>
        <ul>
          {card.rows.map((row, i) => (
            <li key={i}>{row.name} — {row.quantity} шт. — інв. № {row.invNumber} — {row.price} грн</li>
          ))}
        </ul>
        {card.file && (
          <div>
            <h4>Сканкопія:</h4>
            <a href={`http://localhost:4000${card.file}`} target="_blank" rel="noreferrer">📎 Переглянути / Друк</a>
          </div>
        )}
        <button onClick={onClose} style={{ marginTop: 10 }}>Закрити</button>
      </div>
    </div>
  );
};

export default ModalView;
