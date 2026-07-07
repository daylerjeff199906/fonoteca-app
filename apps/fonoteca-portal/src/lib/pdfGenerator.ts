import { jsPDF } from 'jspdf';
import { type Species } from '../data/species';

export const generateSpeciesPDF = (species: Species, lang: string) => {
    try {
        console.log("generateSpeciesPDF started", species, lang);
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let currentY = 20;

    // Helper to add header on each page
    const drawHeader = () => {
        doc.setFillColor(15, 37, 49); // Primary dark (#0F2531)
        doc.rect(0, 0, pageWidth, 25, 'F');
        
        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('BIBLIOTECA ACÚSTICA DE FAUNA AMAZÓNICA', margin, 12);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(200, 200, 200);
        doc.text('INSTITUTO DE INVESTIGACIONES DE LA AMAZONÍA PERUANA - IIAP', margin, 18);

        // Accent bar
        doc.setFillColor(141, 198, 63); // Accent green (#8DC63F)
        doc.rect(0, 25, pageWidth, 2, 'F');
    };

    // Helper to add footer on each page
    const drawFooter = (pageNumber: number, totalPages: number) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        
        // Left footer
        doc.text('fonoteca.iiap.gob.pe', margin, pageHeight - 10);
        
        // Right footer (page numbers)
        const pageText = `${lang === 'es' ? 'Página' : lang === 'pt' ? 'Página' : 'Page'} ${pageNumber} / ${totalPages}`;
        doc.text(pageText, pageWidth - margin - 20, pageHeight - 10);
    };

    const checkPageOverflow = (neededHeight: number) => {
        if (currentY + neededHeight > pageHeight - 20) {
            doc.addPage();
            currentY = 40; // start below header space
            return true;
        }
        return false;
    };

    // Initialize first page layout
    currentY = 40;

    // Species Names
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(15, 37, 49);
    
    const scientificName = species.scientificName || '';
    const commonName = (species[`commonName_${lang}` as keyof Species] || species.commonName_es || '') as string;
    
    // Draw scientific name
    doc.setFont('helvetica', 'italic');
    doc.text(scientificName, margin, currentY);
    
    // Move Y past scientific name
    currentY += 8;

    if (commonName) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text(`(${commonName})`, margin, currentY);
        currentY += 10;
    } else {
        currentY += 4;
    }

    // Divider Line
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // Helper to draw section header
    const drawSectionTitle = (title: string) => {
        checkPageOverflow(15);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(141, 198, 63);
        doc.text(title.toUpperCase(), margin, currentY);
        currentY += 3;
        doc.setDrawColor(141, 198, 63);
        doc.setLineWidth(0.5);
        doc.line(margin, currentY, margin + 35, currentY);
        doc.setLineWidth(0.1); // reset
        currentY += 6;
    };

    // Helper to draw a key-value table
    const drawKeyValueTable = (
        title: string,
        data: { label: string; value: any }[],
        col1Header: string,
        col2Header: string,
        col1Width: number
    ) => {
        const col2Width = contentWidth - col1Width;
        
        drawSectionTitle(title);
        
        // Draw table header
        checkPageOverflow(12);
        
        // Header background
        doc.setFillColor(15, 37, 49); // Primary dark (#0F2531)
        doc.rect(margin, currentY, contentWidth, 8, 'F');
        
        // Header text
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text(col1Header, margin + 4, currentY + 5.5);
        doc.text(col2Header, margin + col1Width + 4, currentY + 5.5);
        
        currentY += 8;
        
        // Draw rows
        data.forEach((item, idx) => {
            const valText = String(item.value);
            const valLines = doc.splitTextToSize(valText, col2Width - 8);
            const rowHeight = Math.max(8, 6 + (valLines.length * 4));
            
            checkPageOverflow(rowHeight);
            
            // Background fill
            if (idx % 2 === 0) {
                doc.setFillColor(248, 249, 250); // Light gray
            } else {
                doc.setFillColor(255, 255, 255); // White
            }
            doc.rect(margin, currentY, contentWidth, rowHeight, 'F');
            
            // Borders: Draw horizontal bottom border and vertical cell border
            doc.setDrawColor(220, 225, 228);
            doc.setLineWidth(0.1);
            doc.rect(margin, currentY, contentWidth, rowHeight, 'S');
            // Vertical separator line
            doc.line(margin + col1Width, currentY, margin + col1Width, currentY + rowHeight);
            
            // Row text
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            doc.setTextColor(70, 70, 70);
            doc.text(item.label, margin + 4, currentY + 5.5);
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 30, 30);
            doc.text(valLines, margin + col1Width + 4, currentY + 5.5);
            
            currentY += rowHeight;
        });
        
        currentY += 24; // Margin after table (4 rows separation)
    };

    // Section 1: Taxonomy
    const taxonomyData = [
        { label: lang === 'es' ? 'Reino' : 'Kingdom', value: species.kingdom || 'Animalia' },
        { label: lang === 'es' ? 'Filo' : 'Phylum', value: species.phylum || '' },
        { label: lang === 'es' ? 'Clase' : 'Class', value: species.class_name || '' },
        { label: lang === 'es' ? 'Orden' : 'Order', value: species.order || '' },
        { label: lang === 'es' ? 'Familia' : 'Family', value: species.family || '' },
        { label: lang === 'es' ? 'Género' : 'Genus', value: species.genus || '' },
    ].filter(t => t.value);

    const taxonomyHeaders = lang === 'es' 
        ? { title: 'Clasificación Taxonómica', col1: 'Rango', col2: 'Taxón' } 
        : lang === 'pt' 
        ? { title: 'Classificação Taxonômica', col1: 'Categoria', col2: 'Táxon' } 
        : { title: 'Taxonomic Classification', col1: 'Rank', col2: 'Taxon' };

    drawKeyValueTable(
        taxonomyHeaders.title,
        taxonomyData,
        taxonomyHeaders.col1,
        taxonomyHeaders.col2,
        50
    );

    // Section 2: Metadata table
    if (species.databaseDetails) {
        const detailHeaders = lang === 'es'
            ? { title: 'Detalles de Registro y Ocurrencia', col1: 'Concepto', col2: 'Valor' }
            : { title: 'Record & Occurrence Details', col1: 'Field', col2: 'Value' };

        const detailsData = [
            { label: lang === 'es' ? 'ID de Ocurrencia' : 'Occurrence ID', value: species.databaseDetails.occurrenceID },
            { label: lang === 'es' ? 'Número de Catálogo' : 'Catalog Number', value: species.databaseDetails.catalogNumber },
            { label: lang === 'es' ? 'Fecha de Registro' : 'Record Date', value: species.databaseDetails.occurrence_date },
            { label: lang === 'es' ? 'Identificado Por' : 'Identified By', value: species.databaseDetails.identifiedBy },
            { label: lang === 'es' ? 'Base de Registro' : 'Basis of Record', value: species.databaseDetails.basisOfRecord },
            { label: lang === 'es' ? 'Institución / Museo' : 'Institution / Museum', value: species.databaseDetails.institutionName || species.databaseDetails.institutionCode },
            { label: lang === 'es' ? 'Colección Biológica' : 'Biological Collection', value: species.databaseDetails.collectionName || species.databaseDetails.collectionCode },
            { label: lang === 'es' ? 'Localidad' : 'Locality', value: species.databaseDetails.locality || species.location },
            { label: lang === 'es' ? 'Coordenadas' : 'Coordinates', value: (species.databaseDetails.decimalLatitude && species.databaseDetails.decimalLongitude) ? `${species.databaseDetails.decimalLatitude}, ${species.databaseDetails.decimalLongitude}` : '' },
            { label: lang === 'es' ? 'Ecosistema' : 'Ecosystem', value: species.databaseDetails.ecosystem_name },
        ].filter(d => d.value);

        drawKeyValueTable(
            detailHeaders.title,
            detailsData,
            detailHeaders.col1,
            detailHeaders.col2,
            60
        );
    }

    // Section 3: Distribution & Location
    const getLocalizedContinent = (cont: string | null | undefined, l: string) => {
        if (!cont) return '';
        const clean = cont.trim().toLowerCase();
        if (clean === 'south america' || clean === 'southamerica') {
            return l === 'es' ? 'Sudamérica' : l === 'pt' ? 'América do Sul' : 'South America';
        }
        return cont;
    };

    const higherGeography = [
        getLocalizedContinent(species.databaseDetails?.continent, lang),
        species.databaseDetails?.country,
        species.databaseDetails?.stateProvince
    ].filter(Boolean).join("; ");

    const geoHeaders = lang === 'es'
        ? { title: 'Distribución y Lugar', col1: 'Concepto / Propiedad', col2: 'Detalle de Ubicación' }
        : lang === 'pt'
        ? { title: 'Distribuição e Local', col1: 'Categoria / Propriedade', col2: 'Detalhe de Localização' }
        : { title: 'Distribution & Location', col1: 'Category / Property', col2: 'Detailed Value' };

    const geoLabels = {
        es: {
            higherGeography: "Geografía superior",
            continent: "Continente",
            country: "País o área",
            stateProvince: "Departamento/Estado/Provincia",
            province: "Provincia",
            district: "Distrito",
            locality: "Localidad",
            latitude: "Latitud decimal",
            longitude: "Longitud decimal",
        },
        en: {
            higherGeography: "Higher geography",
            continent: "Continent",
            country: "Country or area",
            stateProvince: "State/Province",
            province: "Province",
            district: "District",
            locality: "Locality",
            latitude: "Decimal latitude",
            longitude: "Decimal longitude",
        },
        pt: {
            higherGeography: "Geografia superior",
            continent: "Continente",
            country: "País ou área",
            stateProvince: "Estado/Província",
            province: "Província",
            district: "Distrito",
            locality: "Localidade",
            latitude: "Latitude decimal",
            longitude: "Longitude decimal",
        }
    };

    const activeLang = (lang === 'es' || lang === 'en' || lang === 'pt') ? lang : 'es';

    const geoData = [
        { label: geoLabels[activeLang].higherGeography, value: higherGeography },
        { label: geoLabels[activeLang].continent, value: getLocalizedContinent(species.databaseDetails?.continent, activeLang) },
        { label: geoLabels[activeLang].country, value: species.databaseDetails?.country },
        { label: geoLabels[activeLang].stateProvince, value: species.databaseDetails?.stateProvince },
        { label: geoLabels[activeLang].province, value: species.databaseDetails?.province },
        { label: geoLabels[activeLang].district, value: species.databaseDetails?.district },
        { label: geoLabels[activeLang].locality, value: species.databaseDetails?.locality || species.location },
        { label: geoLabels[activeLang].latitude, value: species.databaseDetails?.decimalLatitude?.toString() },
        { label: geoLabels[activeLang].longitude, value: species.databaseDetails?.decimalLongitude?.toString() },
        { label: lang === 'es' ? 'Datum Geodésico' : 'Geodetic Datum', value: species.databaseDetails?.geodeticDatum },
        { label: lang === 'es' ? 'Protocolo de Georreferenciación' : 'Georeference Protocol', value: species.databaseDetails?.georeferenceProtocol },
        { label: lang === 'es' ? 'Fuentes de Georreferenciación' : 'Georeference Sources', value: species.databaseDetails?.georeferenceSources },
        { label: lang === 'es' ? 'Fecha de Georreferenciación' : 'Georeferenced Date', value: species.databaseDetails?.georeferencedDate },
    ].filter(row => row.value);

    if (geoData.length > 0) {
        drawKeyValueTable(
            geoHeaders.title,
            geoData,
            geoHeaders.col1,
            geoHeaders.col2,
            60
        );
    }

    // Section 3: Ecology & Description
    const descText = species.description[lang as keyof typeof species.description] || species.description.es;
    if (descText) {
        checkPageOverflow(30);
        drawSectionTitle(lang === 'es' ? 'Descripción y Ecología' : 'Description & Ecology');
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(40, 40, 40);
        
        const descLines = doc.splitTextToSize(descText, contentWidth);
        descLines.forEach((line: string) => {
            checkPageOverflow(5);
            doc.text(line, margin, currentY);
            currentY += 5;
        });
        currentY += 30; // Spacing after description (4 rows separation)
    }

    const characteristics = species.characteristics ? species.characteristics[lang as keyof typeof species.characteristics] : undefined;
    if (characteristics && characteristics.length > 0) {
        checkPageOverflow(25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(15, 37, 49);
        doc.text(lang === 'es' ? 'Características Ecológicas:' : 'Ecological Characteristics:', margin, currentY);
        currentY += 6;

        characteristics.forEach((char) => {
            const charLines = doc.splitTextToSize(`•  ${char}`, contentWidth - 5);
            charLines.forEach((line: string) => {
                checkPageOverflow(5);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(50, 50, 50);
                doc.text(line, margin + 3, currentY);
                currentY += 5;
            });
        });
        currentY += 30; // Spacing after characteristics (4 rows separation)
    }

    // Section 4: Citation
    checkPageOverflow(35);
    drawSectionTitle(lang === 'es' ? 'Referencia de Citación' : 'Citation Reference');
    
    const author = species.databaseDetails?.identifiedBy || species.databaseDetails?.rightsHolder || "Biblioteca Acústica de Fauna Amazónica";
    const year = species.databaseDetails?.occurrence_date ? new Date(species.databaseDetails.occurrence_date).getFullYear() : new Date().getFullYear();
    const catalogNum = species.databaseDetails?.catalogNumber ? ` (Catálogo: ${species.databaseDetails.catalogNumber})` : "";
    const url = `https://fonoteca.iiap.gob.pe/${lang}/species/${species.id}`;
    const accessDate = new Date().toLocaleDateString(lang === 'es' ? 'es-PE' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const citationText = `${author} (${year}). Registro de espécimen de ${scientificName}${catalogNum}. Biblioteca Acústica de Fauna Amazónica. Recuperado el ${accessDate} de ${url}`;
    
    const citationLines = doc.splitTextToSize(citationText, contentWidth - 8);
    const boxHeight = 8 + (citationLines.length * 4);

    checkPageOverflow(boxHeight + 5);

    doc.setFillColor(245, 247, 248);
    doc.rect(margin, currentY, contentWidth, boxHeight, 'F');
    doc.setDrawColor(220, 225, 228);
    doc.rect(margin, currentY, contentWidth, boxHeight, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text(citationLines, margin + 4, currentY + 6);

    // Apply header & footer details to all pages dynamically
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawHeader();
        drawFooter(i, totalPages);
    }

        // Save PDF
        const filename = `Ficha_${scientificName.replace(/\s+/g, '_')}.pdf`;
        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            doc.save(filename);
        }
        console.log("PDF saved successfully!");
    } catch (error) {
        console.error("Error generating/saving PDF:", error);
    }
};
