import { subscriptionForm } from "../data/demoContent";

const SubscriptionsPage = () => {
  return (
    <div className="page">
      <h1 className="page__title">Подписки</h1>

      <section className="section">
        <h2 className="section__title">Создать подписку</h2>
        <input className="input" placeholder="Сервис" value="" readOnly />
        <input className="input" value="9.99" readOnly />

        <p className="label">Валюта</p>
        <div className="pill-row">
          {subscriptionForm.currencies.map((currency) => (
            <button
              key={currency.label}
              type="button"
              className={`pill-button${currency.active ? " pill-button--active" : ""}`}
            >
              {currency.label}
            </button>
          ))}
        </div>

        <input className="input" placeholder="Следующее списание YYYY-MM-DD" value="" readOnly />

        <p className="label">Период списания: MONTHLY</p>
        <div className="pill-row">
          {subscriptionForm.billingPeriods.map((period) => (
            <button
              key={period.label}
              type="button"
              className={`pill-button${period.active ? " pill-button--active" : ""}`}
            >
              {period.label}
            </button>
          ))}
        </div>

        <p className="label">Категория: Нет</p>
        <div className="pill-row">
          {subscriptionForm.categories.map((category) => (
            <button
              key={category.label}
              type="button"
              className={`pill-button${category.active ? " pill-button--active" : ""}`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <button type="button" className="text-action">
          Создать
        </button>
      </section>

      <section className="section">
        <h2 className="section__title">Список</h2>
        <input className="input" placeholder="Search service/category" value="" readOnly />

        <p className="label">Status filter</p>
        <div className="pill-row">
          {subscriptionForm.statusFilters.map((status) => (
            <button
              key={status.label}
              type="button"
              className={`pill-button${status.active ? " pill-button--active" : ""}`}
            >
              {status.label}
            </button>
          ))}
        </div>

        <p className="label">Sort by</p>
        <div className="pill-row">
          {subscriptionForm.sortOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              className={`pill-button${option.active ? " pill-button--active" : ""}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p>Подписок пока нет.</p>
      </section>

      <section className="section">
        <h2 className="section__title">Ближайшие (7 дней)</h2>
        <p>Ближайших списаний нет.</p>
      </section>

      <section className="section">
        <h2 className="section__title">Напоминания (7 дней)</h2>
        <p>Напоминаний нет.</p>
      </section>
    </div>
  );
};

export default SubscriptionsPage;
