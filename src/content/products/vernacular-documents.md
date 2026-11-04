---
title: "Vernacular Documents – Document Generation Service"
shortTitle: "Vernacular Documents"
code: "05 / VERNACULAR"
order: 4.5
pillar: "Engineer"
badge: "Low-code (OutSystems)"
statusTag: "Deployed for an enterprise client"
buildTag: "Low-code (OutSystems)"
seoTitle: "Vernacular Documents | Document Generation Service | RHSP"
seoDescription: "Generate finished Word and PDF documents in any language you supply, from approved templates, on demand through an API. Built on OutSystems."
oneLiner: "Template-driven documents in any language you supply, generated on demand for business systems."
outcomeHeadline: "Any language, one approved workflow."

stage1:
  tagline: "Every page in its reader's language."
  problem: "Regulated paperwork must be correct and readable in the customer's own language. Teams need fixed legal text with customer details filled in, every time."
  painPoints:
    - "Each language needs its own version of every document."
    - "Template changes need review before anything reaches customers."
    - "Failed or missing documents are hard to trace and repair."

stage2:
  tagline: "Approve once, reuse everywhere."
  intro: "The value sat in reuse."
  points:
    - "One approved template serves every request."
    - "New languages reuse the same placeholders, with your translation."
    - "No staff time spent drafting routine documents."

stage3:
  tagline: "Placeholders with purpose."
  features:
    - title: "Word templates."
      description: "Upload a Word file with text, image and table placeholders."
    - title: "Maker and checker review."
      description: "Every template is approved before it can serve a request."
    - title: "Languages you add."
      description: "Upload your own translated Word file as a new language, with the same placeholders."
    - title: "Document API."
      description: "Other systems send a JSON request and receive Word, PDF and a callback."
    - title: "Revision control."
      description: "Minor and major revisions stay in draft until approved."
    - title: "Request monitoring."
      description: "Admins track every request and regenerate Word, PDF or callback."
  builtWith:
    - "OutSystems"
    - "JSON API"
    - "Amazon S3 storage"
    - "Word and PDF output"
  screenshot:
    file: "image7v.png"
    alt: "Template preview showing a Word document with placeholder tokens."
    caption: "A template with its placeholders."
  loop:
    name: "vernacular-template-flow"
    caption: "Add a template, preview it with sample data, submit for review."

stage4:
  tagline: "Maker proposes, checker confirms."
  intro: "Watch a template go from draft to approved, then generate a document."
  videoId: ""

stage5:
  tagline: "Your languages, your angle."
  makeItYours: "You supply the translated Word templates and salutations, so any language your customers read can be added. The service fills the document and does not translate."

stage6:
  tagline: "Every request, accounted for."
  resultsHeadline: "Approve once. Reuse in every language you add."
  results:
    - "Documents are generated on demand with no manual drafting."
    - "Only approved templates serve requests."
    - "Every request is on record and can be regenerated."
---
