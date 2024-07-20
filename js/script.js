document.getElementById('imageUpload').addEventListener('change', handleImageUpload);

let images = [];

function handleImageUpload(event) {
    images = [];
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = function(e) {
            images.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
    }
}

document.getElementById('convertBtn').addEventListener('click', convertToPDF);

async function convertToPDF() {
    if (images.length === 0) {
        alert('Please upload at least one image.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    for (let i = 0; i < images.length; i++) {
        if (i > 0) {
            pdf.addPage();
        }
        await addImageToPDF(pdf, images[i]);
    }

    const pdfOutput = pdf.output('blob');
    const url = URL.createObjectURL(pdfOutput);

    const outputSection = document.getElementById('output');
    outputSection.innerHTML = `<a href="${url}" download="converted.pdf">Download PDF</a>`;
}

function addImageToPDF(pdf, imageData) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = imageData;
        img.onload = function() {
            const width = img.width > pdf.internal.pageSize.width ? pdf.internal.pageSize.width : img.width;
            const height = (img.height / img.width) * width;
            pdf.addImage(img, 'JPEG', 0, 0, width, height);
            resolve();
        };
    });
}
