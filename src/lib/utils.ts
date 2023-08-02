export const downloadCsvInServiceWorker = (csv: any, name: string) => {
  const blob = new Blob([csv], { type: 'text/csv' });
  // use BlobReader object to read Blob data
  const reader = new FileReader();
  reader.onload = () => {
    const buffer = reader.result;
    // @ts-expect-error
    const url = `data:${blob.type};base64,${btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))}`;
    chrome.downloads.download({
      url: url,
      filename: `${name} domain.csv`,
      conflictAction: 'uniquify'
    });
  };
  reader.readAsArrayBuffer(blob);
}

export const downloadCsvInDOM = (csv: any, name: string) => {
	// Creating a Blob for having a csv file format and passing the data with type
	const blob = new Blob([csv], { type: 'text/csv' });
	// Creating an object for downloading url
	const url = window.URL.createObjectURL(blob);
	// Creating an anchor(a) tag of HTML
	const a = document.createElement('a');
	// Passing the blob downloading url
  a.href = url;
	// Setting the anchor tag attribute for downloading and passing the download file name
  a.download = `${name} domain.csv`;
  // Setting the display attribute to prevent showing the button in the DOM.
  a.style.display = 'none';
  // Add the button to the DOM
	document.body.appendChild(a);
	// Performing a download with click
	a.click();
  // Remove the button from the DOM
  document.body.removeChild(a);
}