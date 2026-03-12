import { useEffect, useMemo, useState, type FormEvent } from "react";
import { importApi } from "../api/importApi";
import { useLanguage } from "../i18n/LanguageProvider";
import type { ImportConsentStatus, ImportHistoryItem, ImportProvider, ImportResult } from "../types/import";

const PROVIDERS: ImportProvider[] = ["GMAIL", "YANDEX", "MAIL_RU", "BANK_API"];

const ImportCsvPage = () => {
  const { t } = useLanguage();
  const [provider, setProvider] = useState<ImportProvider>("GMAIL");
  const [consent, setConsent] = useState<ImportConsentStatus | null>(null);
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<ImportResult | null>(null);
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJobLoading, setIsJobLoading] = useState(false);

  const providerLabel = (value: ImportProvider) => {
    switch (value) {
      case "GMAIL": return t("import_provider_gmail");
      case "YANDEX": return t("import_provider_yandex");
      case "MAIL_RU": return t("import_provider_mail_ru");
      case "BANK_API": return t("import_provider_bank_api");
    }
  };

  const loadImportPage = async (providerValue: ImportProvider) => {
    setError("");
    setIsLoading(true);
    try {
      const [consentResponse, historyResponse] = await Promise.all([
        importApi.status(providerValue),
        importApi.history()
      ]);
      setConsent(consentResponse);
      setHistory(historyResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("import_title"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setSelectedJobId(null);
    setSelectedJob(null);
    setResult(null);
    void loadImportPage(provider);
  }, [provider]);

  const visibleHistory = useMemo(() => history.filter((item) => item.provider === provider), [history, provider]);

  const loadJobDetails = async (jobId: number) => {
    setError("");
    setIsJobLoading(true);
    try {
      const response = await importApi.details(jobId);
      setSelectedJobId(jobId);
      setSelectedJob(response);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("import_details_title"));
    } finally {
      setIsJobLoading(false);
    }
  };

  const handleConsentToggle = async () => {
    setError("");
    try {
      const response = consent?.status === "GRANTED" ? await importApi.revoke(provider) : await importApi.grant(provider);
      setConsent(response);
    } catch (consentError) {
      setError(consentError instanceof Error ? consentError.message : t("import_consent"));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!from.trim() || !subject.trim() || !body.trim()) {
      setError(t("import_fill_message"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await importApi.start(provider, [{
        externalId: `manual-${Date.now()}`,
        from: from.trim(),
        subject: subject.trim(),
        body: body.trim(),
        receivedAt: new Date().toISOString()
      }]);
      setResult(response);
      setSelectedJobId(response.jobId);
      setFrom("");
      setSubject("");
      setBody("");
      await loadImportPage(provider);
      await loadJobDetails(response.jobId);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t("import_start"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page__title">{t("import_title")}</h1>
      {error ? <p className="form-message form-message--error">{error}</p> : null}

      <section className="section">
        <h2 className="section__title">{t("import_provider")}</h2>
        <div className="pill-row">
          {PROVIDERS.map((item) => (
            <button key={item} type="button" className={`pill-button${provider === item ? " pill-button--active" : ""}`} onClick={() => setProvider(item)}>
              {providerLabel(item)}
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">{t("import_consent")}</h2>
        <p>{t("import_status")}: {consent?.status ?? (isLoading ? t("common_loading") : t("import_unknown"))}</p>
        <button type="button" className="text-action text-action--center" onClick={() => void handleConsentToggle()}>
          {consent?.status === "GRANTED" ? t("import_revoke") : t("import_grant")}
        </button>
        <p>{consent?.status === "GRANTED" ? t("import_consent_hint_on") : t("import_consent_hint_off")}</p>
      </section>

      <section className="section">
        <h2 className="section__title">{t("import_start")}</h2>
        <form onSubmit={handleSubmit}>
          <input className="input" value={from} onChange={(event) => setFrom(event.target.value)} placeholder={t("import_sender_placeholder")} />
          <input className="input" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder={t("import_subject_placeholder")} />
          <textarea className="input input--textarea" placeholder={t("import_body_placeholder")} value={body} onChange={(event) => setBody(event.target.value)} />
          <button type="submit" className="button" disabled={isSubmitting || consent?.status !== "GRANTED"}>
            {isSubmitting ? t("import_start_loading") : t("import_start_button")}
          </button>
        </form>
      </section>

      {result ? (
        <section className="section">
          <h2 className="section__title">{t("import_last_result")}</h2>
          <p>{t("import_job")}: {result.jobId}</p>
          <p>{t("import_status")}: {result.status}</p>
          <p>{t("import_processed")}: {result.processed}, {t("import_created")}: {result.created}, {t("import_skipped")}: {result.skipped}, {t("import_errors")}: {result.errors}</p>
        </section>
      ) : null}

      <section className="section">
        <h2 className="section__title">{t("import_history")}</h2>
        {visibleHistory.length ? (
          <div className="stack-list">
            {visibleHistory.map((item) => (
              <button key={item.id} type="button" className={`card-row card-row--interactive${selectedJobId === item.id ? " card-row--selected" : ""}`} onClick={() => void loadJobDetails(item.id)}>
                <strong>{item.provider} · {item.status}</strong>
                <span>{item.startedAt} {item.finishedAt ? `→ ${item.finishedAt}` : ""}</span>
              </button>
            ))}
          </div>
        ) : <p>{isLoading ? t("common_loading") : t("import_no_jobs")}</p>}
      </section>

      <section className="section">
        <h2 className="section__title">{t("import_details_title")}</h2>
        {selectedJob ? (
          <div className="section__stack">
            <div className="details-grid">
              <p><strong>{t("import_job")}:</strong> {selectedJob.jobId}</p>
              <p><strong>{t("import_status")}:</strong> {selectedJob.status}</p>
              <p><strong>{t("import_processed")}:</strong> {selectedJob.processed}</p>
              <p><strong>{t("import_created")}:</strong> {selectedJob.created}</p>
              <p><strong>{t("import_skipped")}:</strong> {selectedJob.skipped}</p>
              <p><strong>{t("import_errors")}:</strong> {selectedJob.errors}</p>
            </div>
            <p>{selectedJob.startedAt}{selectedJob.finishedAt ? ` → ${selectedJob.finishedAt}` : ""}</p>
            <div>
              <p className="label">{t("import_job_errors")}</p>
              {selectedJob.errorItems.length ? (
                <div className="stack-list">
                  {selectedJob.errorItems.map((item, index) => (
                    <div key={`${item.externalId ?? "missing"}-${index}`} className="card-row">
                      <strong>{t("import_job_error_external_id")}: {item.externalId ?? t("common_none")}</strong>
                      <span>{t("import_job_error_reason")}: {item.reason}</span>
                    </div>
                  ))}
                </div>
              ) : <p>{t("import_job_no_errors")}</p>}
            </div>
          </div>
        ) : <p>{isJobLoading ? t("common_loading") : t("import_select_job")}</p>}
      </section>
    </div>
  );
};

export default ImportCsvPage;
