document.getElementById('imageUpload').addEventListener('change', handleImageUpload);

let images = [];

function handleImageUpload(event) {
    images = [];
    const files = event.target.files;
    const messages = document.getElementById('messages');
    messages.innerHTML = '';

    for (let i = 0; i < files.length; i++) {
        if (!files[i].type.startsWith('image/')) {
            messages.innerHTML += `<p class="error">Unsupported file type: ${files[i].name}</p>`;
            continue;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            images.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
    }
}

document.getElementById('convertBtn').addEventListener('click', convertToPDF);

async function convertToPDF() {
    const loader = document.getElementById('loader');
    const messages = document.getElementById('messages');
    messages.innerHTML = '';
    
    if (images.length === 0) {
        messages.innerHTML = '<p class="error">Please upload at least one image.</p>';
        return;
    }

    loader.classList.remove('hidden');

    try {
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
        messages.innerHTML = '<p class="success">PDF successfully created!</p>';
    } catch (error) {
        messages.innerHTML = `<p class="error">An error occurred during conversion: ${error.message}</p>`;
    } finally {
        loader.classList.add('hidden');
    }
}

function addImageToPDF(pdf, imageData) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imageData;
        img.onload = function() {
            const width = img.width > pdf.internal.pageSize.width ? pdf.internal.pageSize.width : img.width;
            const height = (img.height / img.width) * width;
            pdf.addImage(img, 'JPEG', 0, 0, width, height);
            resolve();
        };
        img.onerror = reject;
    });
}
