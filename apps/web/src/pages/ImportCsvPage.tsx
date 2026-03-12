import { useEffect, useState, type FormEvent } from "react";
import { importApi } from "../api/importApi";
import { useLanguage } from "../i18n/LanguageProvider";
import type { ImportConsentStatus, ImportHistoryItem, ImportResult } from "../types/import";

const ImportCsvPage = () => {
  const { t } = useLanguage();
  const [consent, setConsent] = useState<ImportConsentStatus | null>(null);
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadImportPage = async () => {
    setError("");
    setIsLoading(true);

    try {
      const [consentResponse, historyResponse] = await Promise.all([
        importApi.status(),
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
    void loadImportPage();
  }, []);

  const handleConsentToggle = async () => {
    setError("");

    try {
      const response =
        consent?.status === "GRANTED" ? await importApi.revoke() : await importApi.grant();
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
      const response = await importApi.start([
        {
          externalId: `manual-${Date.now()}`,
          from: from.trim(),
          subject: subject.trim(),
          body: body.trim(),
          receivedAt: new Date().toISOString()
        }
      ]);

      setResult(response);
      setFrom("");
      setSubject("");
      setBody("");
      await loadImportPage();
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
        <h2 className="section__title">{t("import_consent")}</h2>
        <p>
          {t("import_status")}: {consent?.status ?? (isLoading ? t("common_loading") : t("import_unknown"))}
        </p>
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
          <textarea
            className="input input--textarea"
            placeholder={t("import_body_placeholder")}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
          <button
            type="submit"
            className="button"
            disabled={isSubmitting || consent?.status !== "GRANTED"}
          >
            {isSubmitting ? t("import_start_loading") : t("import_start_button")}
          </button>
        </form>
      </section>

      {result ? (
        <section className="section">
          <h2 className="section__title">{t("import_last_result")}</h2>
          <p>{t("import_job")}: {result.jobId}</p>
          <p>
            {t("import_status")}: {result.status}
          </p>
          <p>
            {t("import_processed")}: {result.processed}, {t("import_created")}: {result.created},{" "}
            {t("import_skipped")}: {result.skipped}, {t("import_errors")}: {result.errors}
          </p>
        </section>
      ) : null}

      <section className="section">
        <h2 className="section__title">{t("import_history")}</h2>
        {history.length ? (
          <div className="stack-list">
            {history.map((item) => (
              <div key={item.id} className="card-row">
                <strong>
                  {item.provider} · {item.status}
                </strong>
                <span>
                  {item.startedAt} {item.finishedAt ? `→ ${item.finishedAt}` : ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p>{isLoading ? t("common_loading") : t("import_no_jobs")}</p>
        )}
      </section>
    </div>
  );
};

export default ImportCsvPage;
