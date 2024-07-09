import DOMPurify from "dompurify";
export const HTMLRenderer = ({ html }: { html: string }) => {
  const sanitizedHtmlContent = DOMPurify.sanitize(html);
  console.log(html);
  console.log(sanitizedHtmlContent);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtmlContent }} />;
};
