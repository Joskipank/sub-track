import { dashboardData } from "../data/demoContent";
import { useAuth } from "../hooks/useAuth";

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="page">
      <h1 className="page__title">Дашборд</h1>
      <p className="muted">Вы вошли как {user?.email ?? dashboardData.email}</p>

      <section className="section">
        <h2 className="section__title">Сводка</h2>
        <p>Сумма: {dashboardData.total}</p>
        <p>Активные подписки: {dashboardData.activeSubscriptions}</p>
        <p>Период: {dashboardData.period}</p>
      </section>

      <section className="section">
        <h2 className="section__title">Прогноз</h2>
        <p>Месяц: {dashboardData.forecastMonth}</p>
        <p>Год: {dashboardData.forecastYear}</p>
      </section>

      <section className="section">
        <h2 className="section__title">Ближайшие списания</h2>
        <p>Ближайших списаний нет.</p>
      </section>

      <section className="section">
        <h2 className="section__title">Уведомления</h2>
        <p>Напоминаний нет.</p>
      </section>

      <button type="button" className="text-action text-action--center">
        Обновить
      </button>
    </div>
  );
};

export default DashboardPage;
