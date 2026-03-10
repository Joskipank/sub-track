import { importData } from "../data/demoContent";

const ImportCsvPage = () => {
  return (
    <div className="page">
      <h1 className="page__title">Import</h1>

      <section className="section">
        <h2 className="section__title">Import consent</h2>
        <p>Status: {importData.status}</p>
        <button type="button" className="text-action text-action--center">
          Grant consent
        </button>
        <p>Grant consent to enable import start.</p>
      </section>

      <section className="section">
        <h2 className="section__title">Start import (MVP)</h2>
        <input className="input" value={importData.from} readOnly />
        <input className="input" value={importData.subject} readOnly />
        <textarea className="input input--textarea" placeholder="Email body" value="" readOnly />
        <button type="button" className="button button--disabled" disabled>
          Start import
        </button>
      </section>

      <section className="section">
        <h2 className="section__title">History</h2>
        <p>No import jobs.</p>
      </section>
    </div>
  );
};

export default ImportCsvPage;
