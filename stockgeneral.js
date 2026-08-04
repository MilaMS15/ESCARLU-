// Lista de modelos con su tipo/categoría (sincronizada con shared.js MODEL_NAMES)
const MODELOS_LIST = [
    { id_modelo: "MOD-001", tipo: "Polo",   nombre: "Camisero MC" },
    { id_modelo: "MOD-002", tipo: "Polo",   nombre: "Camisero ML" },
    { id_modelo: "MOD-003", tipo: "Polo",   nombre: "Girasol MC" },
    { id_modelo: "MOD-004", tipo: "Polo",   nombre: "Girasol ML" },
    { id_modelo: "MOD-005", tipo: "Polo",   nombre: "Redondo MC" },
    { id_modelo: "MOD-006", tipo: "Polo",   nombre: "Redondo ML" },
    { id_modelo: "MOD-007", tipo: "Polo",   nombre: "Cuadrado MC" },
    { id_modelo: "MOD-008", tipo: "Polo",   nombre: "Cuadrado ML" },
    { id_modelo: "MOD-009", tipo: "Polo",   nombre: "Tania MC" },
    { id_modelo: "MOD-010", tipo: "Polo",   nombre: "Tania ML" },
    { id_modelo: "MOD-011", tipo: "Polo",   nombre: "Noemi MC" },
    { id_modelo: "MOD-012", tipo: "Polo",   nombre: "Noemi ML" },
    { id_modelo: "MOD-013", tipo: "Polo",   nombre: "Boton MC" },
    { id_modelo: "MOD-014", tipo: "Polo",   nombre: "Boton ML" },
    { id_modelo: "MOD-015", tipo: "Short",  nombre: "Short Pinza" },
    { id_modelo: "MOD-016", tipo: "Short",  nombre: "Short Boton" },
    { id_modelo: "MOD-017", tipo: "Chompa", nombre: "Chompa Redondo" },
    { id_modelo: "MOD-018", tipo: "Chompa", nombre: "Chompa V" },
    { id_modelo: "MOD-019", tipo: "Buzo",   nombre: "Buzo Normal" },
    { id_modelo: "MOD-020", tipo: "Polo",   nombre: "Corazon MC" },
    { id_modelo: "MOD-021", tipo: "Polo",   nombre: "Corazon ML" }
];

// Mapa rápido id_modelo → tipo
const MODEL_TYPE_MAP = {};
MODELOS_LIST.forEach(m => { MODEL_TYPE_MAP[m.id_modelo] = m.tipo; });

document.addEventListener('DOMContentLoaded', () => {
    // Cargar inventario desde localStorage o DEFAULT_INVENTORY
    let invData = {};
    function loadInv() {
        const rawInv = localStorage.getItem("escarlu_inventory");
        invData = rawInv ? JSON.parse(rawInv) : (typeof DEFAULT_INVENTORY !== 'undefined' ? DEFAULT_INVENTORY : {});
    }
    loadInv();

    const tbody = document.getElementById("inventory-tbody");
    const storeSelect = document.getElementById("store-filter-select");
    const globalSearchInput = document.getElementById("global-search-input");
    const tableSearchInput = document.getElementById("inventory-search-table");
    const filterTipo = document.getElementById("select-filter-tipo");
    const filterModelo = document.getElementById("select-filter-modelo");
    const filterColor = document.getElementById("select-filter-color");
    const btnToggleFiltros = document.getElementById("btnToggleFiltros");
    const filterBar = document.getElementById("filter-bar");

    // Toggle filter bar visibility
    if (btnToggleFiltros && filterBar) {
        btnToggleFiltros.addEventListener("click", () => {
            const isHidden = filterBar.classList.toggle("hidden");
            btnToggleFiltros.classList.toggle("bg-primary", !isHidden);
            btnToggleFiltros.classList.toggle("text-on-primary", !isHidden);
        });
    }

    // Populate color filter dropdown
    if (filterColor) {
        filterColor.innerHTML = '<option value="all">Todos los colores</option>';
        for (const [colorId, colorName] of Object.entries(COLOR_NAMES)) {
            const opt = document.createElement("option");
            opt.value = colorId;
            opt.textContent = colorName;
            filterColor.appendChild(opt);
        }
    }

    // Update models dropdown dynamically based on tipo selection
    function updateFilterModels() {
        if (!filterTipo || !filterModelo) return;
        const selectedType = filterTipo.value;
        // Use escarlu_modelos if available, else fallback to MODELOS_LIST
        const stored = JSON.parse(localStorage.getItem("escarlu_modelos") || "[]");
        const modelsList = stored.length > 0 ? stored : MODELOS_LIST;
        
        filterModelo.innerHTML = '<option value="all">Todos los modelos</option>';
        const filtered = selectedType === "all"
            ? modelsList
            : modelsList.filter(m => (m.tipo || "").toLowerCase() === selectedType.toLowerCase());
        filtered.forEach(m => {
            const opt = document.createElement("option");
            opt.value = m.id_modelo;
            opt.textContent = m.nombre;
            filterModelo.appendChild(opt);
        });
        renderTable();
    }

    if (filterTipo) {
        filterTipo.addEventListener("change", updateFilterModels);
    }
    if (filterModelo) {
        filterModelo.addEventListener("change", renderTable);
    }
    if (filterColor) {
        filterColor.addEventListener("change", renderTable);
    }
    if (tableSearchInput) {
        tableSearchInput.addEventListener('input', renderTable);
    }
    if (globalSearchInput) {
        globalSearchInput.addEventListener('input', renderTable);
    }
    if (storeSelect) {
        storeSelect.addEventListener("change", renderTable);
    }

    // --- Selector de Mes/Año ---
    const periodInput = document.getElementById("filter-period-stock");
    // Set default to current month
    if (periodInput) {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        periodInput.value = `${yyyy}-${mm}`;
        // No hace falta re-renderizar la tabla al cambiar el mes (el stock es un snapshot),
        // pero actualizará el label del Excel al exportar
    }

    function renderTable() {
        if (!invData || Object.keys(invData).length === 0) return;

        const selectedStore = storeSelect ? storeSelect.value : "all";
        const query = (tableSearchInput?.value || globalSearchInput?.value || "").toLowerCase().trim();
        const selectedTipo = filterTipo ? filterTipo.value : "all";
        const selectedModelo = filterModelo ? filterModelo.value : "all";
        const selectedColor = filterColor ? filterColor.value : "all";

        let rowsHtml = "";
        let totalItems = 0;
        let centralItems = 0;
        let tiendasItems = 0;
        let lowAlerts = 0;

        // Modelos y Colores dinámicos desde shared.js
        const models = Object.entries(MODEL_NAMES).map(([key, name]) => ({
            key,
            name,
            sku: `ESC-2026-${key}`
        }));

        const colors = Object.entries(COLOR_NAMES).map(([key, name]) => {
            let badge = "bg-surface-variant text-on-surface-variant";
            if (key === "COL-01") badge = "bg-black text-white";
            else if (key === "COL-02") badge = "bg-white border border-outline-variant text-on-surface";
            else if (key === "COL-03") badge = "bg-amber-100 text-amber-800";
            else if (key === "COL-14") badge = "bg-rose-100 text-rose-800";
            else if (key === "COL-18") badge = "bg-purple-100 text-purple-800";
            return { key, name, badge };
        });

        // Use pre-built MODEL_TYPE_MAP for tipo lookups

        const variantsData = [];

        models.forEach(m => {
            const allowedSizes = getAllowedSizesForModel(m.key);
            const modelTipo = MODEL_TYPE_MAP[m.key] || "Polo";

            // Skip model if Tipo filter is active and doesn't match
            if (selectedTipo !== "all" && modelTipo.toLowerCase() !== selectedTipo.toLowerCase()) {
                return;
            }

            // Skip model if Modelo filter is active and doesn't match
            if (selectedModelo !== "all" && m.key !== selectedModelo) {
                return;
            }

            colors.forEach(c => {
                // Skip color if Color filter is active and doesn't match
                if (selectedColor !== "all" && c.key !== selectedColor) {
                    return;
                }

                // Filtro de búsqueda textual
                const matchSearch = m.name.toLowerCase().includes(query) || c.name.toLowerCase().includes(query) || m.sku.toLowerCase().includes(query);
                if (!matchSearch) return;

                let stSum = 0, sSum = 0, mSum = 0, lSum = 0, xlSum = 0;

                // Sumar según filtro de sede
                Object.keys(invData).forEach(sKey => {
                    const storeInv = invData[sKey];
                    if (storeInv && storeInv[m.key] && storeInv[m.key][c.key]) {
                        const sizes = storeInv[m.key][c.key];
                        const stVal = allowedSizes.includes("St") ? (sizes.St || 0) : 0;
                        const sVal = allowedSizes.includes("S") ? (sizes.S || 0) : 0;
                        const mVal = allowedSizes.includes("M") ? (sizes.M || 0) : 0;
                        const lVal = allowedSizes.includes("L") ? (sizes.L || 0) : 0;
                        const xlVal = allowedSizes.includes("XL") ? (sizes.XL || 0) : 0;

                        const rowTotal = stVal + sVal + mVal + lVal + xlVal;
                        if (sKey === "ALM-01") centralItems += rowTotal;
                        else if (sKey.startsWith("TDA-")) tiendasItems += rowTotal;

                        if (selectedStore === "all" || selectedStore === sKey) {
                            stSum += stVal;
                            sSum += sVal;
                            mSum += mVal;
                            lSum += lVal;
                            xlSum += xlVal;
                        }
                    }
                });

                const totalRow = stSum + sSum + mSum + lSum + xlSum;
                if (totalRow < 5) lowAlerts++;

                // Solo contar si pertenece al filtro o si no hay filtro
                if (selectedStore === "all") {
                    totalItems += totalRow;
                } else {
                    totalItems = Object.keys(invData).reduce((sum, sKey) => {
                        if (sKey !== selectedStore) return sum;
                        const storeInv = invData[sKey];
                        let storeSum = 0;
                        Object.keys(storeInv).forEach(mK => {
                            const allowed = getAllowedSizesForModel(mK);
                            Object.keys(storeInv[mK]).forEach(cK => {
                                const sizes = storeInv[mK][cK];
                                allowed.forEach(sz => {
                                    storeSum += (sizes[sz] || 0);
                                });
                            });
                        });
                        return storeSum;
                    }, 0);
                }

                // Generar detalle por sede para el modal/alert
                let detailStr = "";
                Object.keys(invData).forEach(sKey => {
                    const storeInv = invData[sKey]?.[m.key]?.[c.key] || {};
                    const stVal = allowedSizes.includes("St") ? (storeInv.St || 0) : 0;
                    const sVal = allowedSizes.includes("S") ? (storeInv.S || 0) : 0;
                    const mVal = allowedSizes.includes("M") ? (storeInv.M || 0) : 0;
                    const lVal = allowedSizes.includes("L") ? (storeInv.L || 0) : 0;
                    const xlVal = allowedSizes.includes("XL") ? (storeInv.XL || 0) : 0;
                    const qty = stVal + sVal + mVal + lVal + xlVal;
                    if (qty > 0) {
                        let parts = [];
                        if (allowedSizes.includes("St")) parts.push(`St:${stVal}`);
                        if (allowedSizes.includes("S")) parts.push(`S:${sVal}`);
                        if (allowedSizes.includes("M")) parts.push(`M:${mVal}`);
                        if (allowedSizes.includes("L")) parts.push(`L:${lVal}`);
                        if (allowedSizes.includes("XL")) parts.push(`XL:${xlVal}`);
                        detailStr += `\\n- ${STORE_NAMES[sKey] || sKey}: ${qty} uds (${parts.join(", ")})`;
                    }
                });
                if (!detailStr) detailStr = "Sin existencias en ninguna sede.";

                variantsData.push({
                    modelName: m.name,
                    sku: m.sku,
                    colorName: c.name,
                    colorBadge: c.badge,
                    stSum, sSum, mSum, lSum, xlSum,
                    totalRow,
                    allowedSizes,
                    detailStr,
                    modelKey: m.key,
                    colorKey: c.key
                });
            });
        });

        // --- ORDENAR DE MAYOR A MENOR STOCK ---
        variantsData.sort((a, b) => b.totalRow - a.totalRow);

        variantsData.forEach(v => {
            // Estado de Stock
            let statusBadge = `<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-[11px] font-bold">Disponible</span>`;
            if (v.totalRow === 0) {
                statusBadge = `<span class="px-3 py-1 bg-error-container text-on-error-container rounded-full text-[11px] font-bold">Agotado</span>`;
            } else if (v.totalRow < 5) {
                statusBadge = `<span class="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded-full text-[11px] font-bold">Bajo Stock</span>`;
            }

            function renderSizeCell(sz, val) {
                if (!v.allowedSizes.includes(sz)) {
                    return `<td class="px-4 py-4 text-center text-on-surface/20 font-medium">-</td>`;
                }
                const isLow = val < 5;
                return `<td class="px-4 py-4 text-center font-bold ${isLow ? 'text-error font-extrabold' : ''}">${val}</td>`;
            }

            rowsHtml += `
                <tr class="hover:bg-surface-container-low transition-colors">
                    <td class="px-6 py-4">
                        <div class="font-bold text-on-surface text-xs">${v.modelName}</div>
                        <div class="text-[10px] text-on-surface-variant">REF: ${v.sku}</div>
                    </td>
                    <td class="px-4 py-4">
                        <span class="px-3 py-1 rounded-full text-[11px] font-semibold ${v.colorBadge}">${v.colorName}</span>
                    </td>
                    ${renderSizeCell("St", v.stSum)}
                    ${renderSizeCell("S", v.sSum)}
                    ${renderSizeCell("M", v.mSum)}
                    ${renderSizeCell("L", v.lSum)}
                    ${renderSizeCell("XL", v.xlSum)}
                    <td class="px-4 py-4 text-center font-extrabold text-primary text-sm">${v.totalRow}</td>
                    <td class="px-4 py-4">${statusBadge}</td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="alert('${v.modelName} (${v.colorName}):${v.detailStr}')" class="px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary-container/20 text-[10px] font-bold transition-colors">
                            Ver Sedes
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = rowsHtml || `<tr><td colspan="10" class="p-8 text-center text-on-surface-variant font-semibold">No se encontraron productos que coincidan.</td></tr>`;

        // Calcular totalItems y alerts correctos según filtro
        let filterTotal = 0;
        let filterCentral = 0;
        let filterTiendas = 0;

        tbody.innerHTML = rowsHtml || `<tr><td colspan="10" class="p-8 text-center text-on-surface-variant font-semibold">No se encontraron productos que coincidan.</td></tr>`;

        // Calcular totalItems y alerts correctos según filtro
        let filterTotal = 0;
        let filterCentral = 0;
        let filterTiendas = 0;
        
        Object.keys(invData).forEach(sKey => {
            let storeSum = 0;
            Object.keys(invData[sKey] || {}).forEach(mK => {
                const allowed = getAllowedSizesForModel(mK);
                Object.keys(invData[sKey][mK] || {}).forEach(cK => {
                    const sizes = invData[sKey][mK][cK];
                    allowed.forEach(sz => {
                        storeSum += (sizes[sz] || 0);
                    });
                });
            });
            if (sKey === "ALM-01") filterCentral += storeSum;
            else if (sKey.startsWith("TDA-")) filterTiendas += storeSum;
            
            if (selectedStore === "all" || selectedStore === sKey) {
                filterTotal += storeSum;
            }
        });

        document.getElementById("kpi-total-stock").textContent = `${filterTotal.toLocaleString('es-PE')} unids`;
        document.getElementById("kpi-central-stock").textContent = `${filterCentral.toLocaleString('es-PE')} unids`;
        document.getElementById("kpi-tiendas-stock").textContent = `${filterTiendas.toLocaleString('es-PE')} unids`;
        document.getElementById("kpi-alerts-count").textContent = `${lowAlerts} Variantes`;
    }

    // Bind export button
    const exportBtn = document.getElementById("btnExportarReporte");
    if (exportBtn) {
        exportBtn.addEventListener("click", exportToExcel);
    }

    // Sync en tiempo real
    window.addEventListener('storage', (e) => {
        if (!e.key || e.key === 'escarlu_inventory') {
            loadInv();
            renderTable();
        }
    });

    updateFilterModels(); // init models dropdown on load
});

function exportToExcel() {
    const storeSelect = document.getElementById("store-filter-select");
    const globalSearchInput = document.getElementById("global-search-input");
    const tableSearchInput = document.getElementById("inventory-search-table");
    const filterTipo = document.getElementById("select-filter-tipo");
    const filterModelo = document.getElementById("select-filter-modelo");
    const filterColor = document.getElementById("select-filter-color");

    const selectedStore = storeSelect ? storeSelect.value : "all";
    const query = (tableSearchInput?.value || globalSearchInput?.value || "").toLowerCase().trim();
    const selectedTipo = filterTipo ? filterTipo.value : "all";
    const selectedModelo = filterModelo ? filterModelo.value : "all";
    const selectedColor = filterColor ? filterColor.value : "all";

    // Leer el período seleccionado
    const periodInput = document.getElementById("filter-period-stock");
    const periodValue = periodInput ? periodInput.value : "";
    let periodoLabel = "Período no especificado";
    let periodoFilename = "";
    if (periodValue) {
        const [yr, mo] = periodValue.split("-");
        const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
        periodoLabel = `${meses[parseInt(mo, 10) - 1]} ${yr}`;
        periodoFilename = `${meses[parseInt(mo, 10) - 1]}_${yr}`;
    }

    const rawInv = localStorage.getItem("escarlu_inventory");
    const invData = rawInv ? JSON.parse(rawInv) : (typeof DEFAULT_INVENTORY !== 'undefined' ? DEFAULT_INVENTORY : {});

    // Modelos y Colores dinámicos desde shared.js
    const models = Object.entries(MODEL_NAMES).map(([key, name]) => ({
        key,
        name,
        sku: `ESC-2026-${key}`
    }));

    const colors = Object.entries(COLOR_NAMES).map(([key, name]) => ({
        key,
        name
    }));

    // Use pre-built MODEL_TYPE_MAP for tipo lookups

    let filterTotal = 0;
    let filterCentral = 0;
    let filterTiendas = 0;
    let lowAlerts = 0;

    // Calcular KPIs
    Object.keys(invData).forEach(sKey => {
        let storeSum = 0;
        Object.keys(invData[sKey] || {}).forEach(mK => {
            const allowed = getAllowedSizesForModel(mK);
            Object.keys(invData[sKey][mK] || {}).forEach(cK => {
                const sizes = invData[sKey][mK][cK];
                allowed.forEach(sz => {
                    storeSum += (sizes[sz] || 0);
                });
            });
        });
        if (sKey === "ALM-01") filterCentral += storeSum;
        else if (sKey.startsWith("TDA-")) filterTiendas += storeSum;
        
        if (selectedStore === "all" || selectedStore === sKey) {
            filterTotal += storeSum;
        }
    });

    const tableRows = [];

    models.forEach(m => {
        const allowedSizes = getAllowedSizesForModel(m.key);

        // Skip model if Tipo filter is active and doesn't match
        const modelTipo = MODEL_TYPE_MAP[m.key] || "Polo";
        if (selectedTipo !== "all" && modelTipo.toLowerCase() !== selectedTipo.toLowerCase()) {
            return;
        }

        // Skip model if Modelo filter is active and doesn't match
        if (selectedModelo !== "all" && m.key !== selectedModelo) {
            return;
        }

        colors.forEach(c => {
            // Skip color if Color filter is active and doesn't match
            if (selectedColor !== "all" && c.key !== selectedColor) {
                return;
            }

            let stSum = 0, sSum = 0, mSum = 0, lSum = 0, xlSum = 0;

            // Sumar según filtro de sede
            Object.keys(invData).forEach(sKey => {
                const storeInv = invData[sKey];
                if (storeInv && storeInv[m.key] && storeInv[m.key][c.key]) {
                    const sizes = storeInv[m.key][c.key];
                    const stVal = allowedSizes.includes("St") ? (sizes.St || 0) : 0;
                    const sVal = allowedSizes.includes("S") ? (sizes.S || 0) : 0;
                    const mVal = allowedSizes.includes("M") ? (sizes.M || 0) : 0;
                    const lVal = allowedSizes.includes("L") ? (sizes.L || 0) : 0;
                    const xlVal = allowedSizes.includes("XL") ? (sizes.XL || 0) : 0;

                    if (selectedStore === "all" || selectedStore === sKey) {
                        stSum += stVal;
                        sSum += sVal;
                        mSum += mVal;
                        lSum += lVal;
                        xlSum += xlVal;
                    }
                }
            });

            const totalRow = stSum + sSum + mSum + lSum + xlSum;
            if (totalRow < 5) lowAlerts++;

            // Filtro de búsqueda
            const matchSearch = m.name.toLowerCase().includes(query) || c.name.toLowerCase().includes(query) || m.sku.toLowerCase().includes(query);
            if (!matchSearch) return;

            let estado = "Disponible";
            if (totalRow === 0) {
                estado = "Agotado";
            } else if (totalRow < 5) {
                estado = "Bajo Stock";
            }

            // --- FILTRADO DE VARIACIONES SIN STOCK (Ahorrar espacio y evitar ceros aburridos) ---
            if (totalRow > 0) {
                tableRows.push({
                    row: [
                        `${m.name} (${modelTipo})`,
                        c.name,
                        allowedSizes.includes("St") ? stSum : "-",
                        allowedSizes.includes("S") ? sSum : "-",
                        allowedSizes.includes("M") ? mSum : "-",
                        allowedSizes.includes("L") ? lSum : "-",
                        allowedSizes.includes("XL") ? xlSum : "-",
                        totalRow,
                        estado
                    ],
                    totalRow: totalRow
                });
            }
        });
    });

    // --- ORDENAR DATOS DE MAYOR A MENOR STOCK EN EXCEL ---
    tableRows.sort((a, b) => b.totalRow - a.totalRow);

    const selectedStoreName = selectedStore === "all" ? "Consolidado Total (Todas las Sedes)" : (STORE_NAMES[selectedStore] || selectedStore);

    const ws_data = [
        [`REPORTE DE INVENTARIO GENERAL - ESCARLÚ | ${periodoLabel}`],
        ["Período:", periodoLabel],
        ["Sede Filtrada:", selectedStoreName],
        ["Filtro Tipo:", selectedTipo === "all" ? "Todos los tipos" : selectedTipo],
        ["Filtro Modelo:", selectedModelo === "all" ? "Todos los modelos" : (MODEL_NAMES[selectedModelo] || selectedModelo)],
        ["Filtro Color:", selectedColor === "all" ? "Todos los colores" : (COLOR_NAMES[selectedColor] || selectedColor)],
        [],
        ["RESUMEN DE INDICADORES"],
        ["TOTAL PRENDAS EN STOCK", filterTotal],
        ["ALMACÉN CENTRAL", filterCentral],
        ["STOCK EN TIENDAS", filterTiendas],
        ["VARIANTES EN ALERTA", lowAlerts],
        [],
        ["EXISTENCIAS POR MODELO Y TALLA (Variantes con Stock)"],
        ["MODELO / TIPO", "COLOR", "ST", "S", "M", "L", "XL", "TOTAL STOCK", "ESTADO"]
    ];

    tableRows.forEach(item => {
        ws_data.push(item.row);
    });

    // Create Workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // --- APLICACIÓN DE ESTILOS PRESTIGIO (Escarlú) ---
    const range = XLSX.utils.decode_range(ws['!ref']);

    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_ref = XLSX.utils.encode_cell({c:C, r:R});
            if (!ws[cell_ref]) continue;

            // Inicializar objeto de estilo
            ws[cell_ref].s = {
                font: { name: "Calibri", sz: 11 },
                alignment: { vertical: "center" },
                border: {
                    top: { style: "thin", color: { rgb: "F8C8D4" } },
                    bottom: { style: "thin", color: { rgb: "F8C8D4" } },
                    left: { style: "thin", color: { rgb: "F8C8D4" } },
                    right: { style: "thin", color: { rgb: "F8C8D4" } }
                }
            };

            // Fila de cabecera principal (Fila 1)
            if (R === 0) {
                ws[cell_ref].s = {
                    font: { name: "Cambria", sz: 16, bold: true, color: { rgb: "745475" } },
                    alignment: { horizontal: "left", vertical: "center" }
                };
            }

            // Metadatos superiores (Filas 1 a 6)
            if (R >= 1 && R <= 5) {
                if (C === 0) {
                    ws[cell_ref].s.font.bold = true;
                    ws[cell_ref].s.font.color = { rgb: "4C444B" };
                } else {
                    ws[cell_ref].s.alignment.horizontal = "left";
                }
                ws[cell_ref].s.border = {};
            }

            if (R === 6) ws[cell_ref].s.border = {};

            // Título de Sección "RESUMEN DE INDICADORES"
            if (R === 7) {
                ws[cell_ref].s = {
                    font: { name: "Cambria", sz: 12, bold: true, color: { rgb: "745475" } },
                    fill: { patternType: "solid", fgColor: { rgb: "FFF0F3" } }, // Rosa claro
                    alignment: { horizontal: "left", vertical: "center" },
                    border: {
                        top: { style: "thin", color: { rgb: "F8C8D4" } },
                        bottom: { style: "thin", color: { rgb: "F8C8D4" } }
                    }
                };
            }

            // Filas de Indicadores principales (Filas 8 a 11)
            if (R >= 8 && R <= 11) {
                if (C === 0) {
                    ws[cell_ref].s.font.color = { rgb: "1C1B1B" };
                }
                if (C === 1) {
                    ws[cell_ref].t = 'n';
                    ws[cell_ref].z = '#,##0';
                    ws[cell_ref].s.alignment.horizontal = "right";
                    ws[cell_ref].s.font.bold = true;
                }
            }

            if (R === 12) ws[cell_ref].s.border = {};

            // Título de Sección "EXISTENCIAS POR MODELO Y TALLA"
            if (R === 13) {
                ws[cell_ref].s = {
                    font: { name: "Cambria", sz: 12, bold: true, color: { rgb: "745475" } },
                    fill: { patternType: "solid", fgColor: { rgb: "FFF0F3" } },
                    alignment: { horizontal: "left", vertical: "center" },
                    border: {
                        top: { style: "thin", color: { rgb: "F8C8D4" } },
                        bottom: { style: "thin", color: { rgb: "F8C8D4" } }
                    }
                };
            }

            // Cabeceras de tabla de movimientos (Fila 15, index 14)
            if (R === 14) {
                ws[cell_ref].s = {
                    font: { name: "Calibri", sz: 10, bold: true, color: { rgb: "745475" } },
                    fill: { patternType: "solid", fgColor: { rgb: "F8C8D4" } },
                    alignment: { horizontal: (R >= 2 && R <= 7) ? "center" : "left", vertical: "center" },
                    border: {
                        top: { style: "medium", color: { rgb: "745475" } },
                        bottom: { style: "medium", color: { rgb: "745475" } },
                        left: { style: "thin", color: { rgb: "F8C8D4" } },
                        right: { style: "thin", color: { rgb: "F8C8D4" } }
                    }
                };
            }

            // Filas de datos
            if (R >= 15) {
                const zebraColor = (R % 2 === 0) ? "FAF5F6" : "FFFFFF";
                ws[cell_ref].s.fill = { patternType: "solid", fgColor: { rgb: zebraColor } };

                // Alinear datos numéricos
                if (C >= 2 && C <= 7) {
                    ws[cell_ref].s.alignment.horizontal = "center";
                    if (C === 7) {
                        ws[cell_ref].t = 'n';
                        ws[cell_ref].z = '#,##0';
                        ws[cell_ref].s.font.bold = true;
                        ws[cell_ref].s.font.color = { rgb: "745475" };
                    } else if (ws[cell_ref].v !== "-") {
                        ws[cell_ref].t = 'n';
                        ws[cell_ref].z = '#,##0';
                    }
                }
            }
        }
    }

    // Combinar títulos para alineación limpia
    if(!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } });

    // Set Column Widths
    ws['!cols'] = [
        { wch: 35 }, // MODELO / TIPO
        { wch: 18 }, // COLOR
        { wch: 8 },  // ST
        { wch: 8 },  // S
        { wch: 8 },  // M
        { wch: 8 },  // L
        { wch: 8 },  // XL
        { wch: 15 }, // TOTAL STOCK
        { wch: 15 }  // ESTADO
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Inventario General");

    // Save File — include period in filename
    const filename = periodoFilename
        ? `Reporte_Inventario_ESCARLU_${periodoFilename}.xlsx`
        : "Reporte_Inventario_ESCARLU.xlsx";
    XLSX.writeFile(wb, filename);
}
