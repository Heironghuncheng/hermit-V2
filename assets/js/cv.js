const cvFrame = document.querySelector(".cv-document");
let cvSizeObserver;

function fitCVDocument() {
  const body = cvFrame.contentDocument?.body;
  if (!body) return;

  cvSizeObserver?.disconnect();
  cvSizeObserver = new ResizeObserver(() => {
    cvFrame.style.height = `${Math.ceil(body.getBoundingClientRect().height)}px`;
  });
  cvSizeObserver.observe(body);
}

cvFrame.addEventListener("load", fitCVDocument);
fitCVDocument();
