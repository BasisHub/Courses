// Copied from webforj/webforj-documentation and modified (MIT, (c) 2022 webforJ; see LICENSES/webforJ-MIT.txt).
// Local change: no MUI; native dialog for the expanded view.
import React, {useRef, useState} from 'react';
import './styles.css';

export default function TableWrapper({children, ...props}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);

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

  return (
    <div className="table-wrapper">
      <div className="table-container table-wrapper__scroll">
        <table {...props}>{children}</table>
      </div>
      <button
        type="button"
        className="table-wrapper__expand"
        aria-haspopup="dialog"
        onClick={openDialog}>
        Expand table
      </button>
      <dialog
        ref={dialogRef}
        className="table-wrapper__dialog"
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
