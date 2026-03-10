import { analyticsData } from "../data/demoContent";

const AnalyticsPage = () => {
  return (
    <div className="page">
      <h1 className="page__title">Аналитика</h1>
      <div className="pill-row pill-row--links">
        {analyticsData.tabs.map((tab) => (
          <button key={tab.label} type="button" className="link-tab">
            {tab.label}
          </button>
        ))}
      </div>

      <section className="section">
        <h2 className="section__title">Сводка (month)</h2>
        <p>Сумма: {analyticsData.total}</p>
        <p>Активные подписки: {analyticsData.activeSubscriptions}</p>
        <p>Диапазон: {analyticsData.range}</p>
      </section>

      <section className="section">
        <h2 className="section__title">По категориям</h2>
        <p>Категорий нет.</p>
      </section>

      <section className="section">
        <h2 className="section__title">Прогноз</h2>
        <p>Месяц: {analyticsData.forecastMonth}</p>
        <p>Год: {analyticsData.forecastYear}</p>
      </section>
    </div>
  );
};

export default AnalyticsPage;
