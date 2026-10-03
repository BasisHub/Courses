// Copied from webforj/webforj-documentation and modified (MIT, (c) 2022 webforJ; see LICENSES/webforJ-MIT.txt).
// Local change: no MUI; native dialog for the expanded view. The expand button
// renders client-side only, and only when the table overflows its container.
import React, {useEffect, useRef, useState} from 'react';
import './styles.css';

export default function TableWrapper({children, ...props}) {
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const dialogRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) {
      return undefined;
    }
    const measure = () => setOverflows(scroller.scrollWidth > scroller.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);

  const openDialog = () => {
    setOpen(true);
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  };

  const closeDialog = () => {
    const dialog = dialogRef.current;
    if (dialog && dialog.open) {
      dialog.close();
    }
    setOpen(false);
  };

  // A click on the backdrop targets the dialog itself, outside its box.
  const onDialogClick = (event) => {
    const dialog = dialogRef.current;
    if (!dialog || event.target !== dialog) {
      return;
    }
    const rect = dialog.getBoundingClientRect();
    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    if (!inside) {
      closeDialog();
    }
  };

  return (
    <div className="table-wrapper">
      <div ref={scrollRef} className="table-container table-wrapper__scroll">
        <table {...props}>{children}</table>
      </div>
      {overflows && (
        <button
          type="button"
          className="table-wrapper__expand"
          aria-haspopup="dialog"
          onClick={openDialog}>
          Expand table
        </button>
      )}
      <dialog
        ref={dialogRef}
        className="table-wrapper__dialog"
        onClick={onDialogClick}
        onClose={() => setOpen(false)}>
        {open && (
          <>
            <button
              type="button"
              className="table-wrapper__close"
              autoFocus
              onClick={closeDialog}>
              Close
            </button>
            <div className="table-container">
              <table {...props}>{children}</table>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
