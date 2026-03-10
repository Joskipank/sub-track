import { rangeTabs } from "../data/demoContent";

const UpcomingPage = () => {
  return (
    <div className="page">
      <h1 className="page__title">Ближайшие</h1>
      <div className="pill-row pill-row--links">
        {rangeTabs.map((tab) => (
          <button key={tab.label} type="button" className="link-tab">
            {tab.label}
          </button>
        ))}
      </div>
      <section className="section">
        <p className="muted">Дней: 7</p>
        <p>Ближайших списаний нет.</p>
      </section>
    </div>
  );
};

export default UpcomingPage;
