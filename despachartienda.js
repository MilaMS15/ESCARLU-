// despachartienda.js - ESCARLÚ: Despacho Masivo por Guía

let invData = {};
let reqsData = [];
let movsData = [];
let guiaItems = []; // Array de ítems en la guía actual draft

// Almacén de la sesión: un almacén SOLO despacha desde su propio stock (nunca de otras sedes)
function getOrigenAlmacen() {
    const u = getCurrentUser();
    return (u && u.storeId && u.role === "almacen") ? u.storeId : "ALM-01";
}

function loadDespachoData() {
    try {
        const invStr = localStorage.getItem("escarlu_inventory");
        invData = invStr ? JSON.parse(invStr) : {};
    } catch (e) {
        invData = {};
    }

    try {
        const reqsStr = localStorage.getItem("escarlu_requests");
        reqsData = reqsStr ? JSON.parse(reqsStr) : [];
    } catch (e) {
        reqsData = [];
    }

    try {
        const movsStr = localStorage.getItem("escarlu_movimientos");
        movsData = movsStr ? JSON.parse(movsStr) : [];
    } catch (e) {
        movsData = [];
    }
}

function getAllowedSizesForModel(modelKey) {
    try {
        const modelsList = JSON.parse(localStorage.getItem("escarlu_modelos")) || [];
        const modelObj = modelsList.find(m => m.id_modelo === modelKey);
        if (modelObj && Array.isArray(modelObj.tallas) && modelObj.tallas.length > 0) {
            return modelObj.tallas;
        }

        // Reglas de tallas.png:
        // SHORTS -> S, M, L, XL
        // POLOS, CHOMPAS, BUZOS -> St, L
        if (modelKey === "MOD-015" || modelKey === "MOD-016") {
            return ["S", "M", "L", "XL"];
        }
    } catch (e) {
        console.error("Error reading model tallas:", e);
    }
    return ["St", "L"];
}

function getColorBadgeClass(colorKey) {
    const badgeMap = {
        "COL-01": "bg-black text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm inline-block",
        "COL-02": "bg-stone-100 text-stone-800 border border-stone-300 px-2.5 py-1 rounded-full text-xs font-bold inline-block",
        "COL-03": "bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-bold inline-block",
        "COL-04": "bg-emerald-800 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm inline-block",
        "COL-05": "bg-amber-900 text-white px-2.5 py-1 rounded-full text-xs font-bold inline-block",
        "COL-06": "bg-slate-500 text-white px-2.5 py-1 rounded-full text-xs font-bold inline-block",
        "COL-07": "bg-amber-700 text-white px-2.5 py-1 rounded-full text-xs font-bold inline-block",
        "COL-08": "bg-red-700 text-white px-2.5 py-1 rounded-full text-xs font-bold inline-block",
        "COL-09": "bg-pink-600 text-white px-2.5 py-1 rounded-full text-xs font-bold inline-block",
        "COL-10": "bg-rose-900 text-white px-2.5 py-1 rounded-full text-xs font-bold inline-block",
        "COL-11": "bg-blue-950 text-white px-2.5 py-1 rounded-full text-xs font-bold inline-block",
        "COL-12": "bg-yellow-400 text-yellow-950 px-2.5 py-1 rounded-full text-xs font-bold inline-block",
        "COL-13": "bg-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-bold inline-block",
        "COL-14": "bg-pink-200 text-pink-900 border border-pink-300 px-2.5 py-1 rounded-full text-xs font-bold inline-block",
        "COL-15": "bg-stone-600 text-white px-2.5 py-1 rounded-full text-xs font-bold inline-block",
        "COL-16": "bg-teal-700 text-white px-2.5 py-1 rounded-full text-xs font-bold inline-block",
        "COL-17": "bg-sky-300 text-sky-950 px-2.5 py-1 rounded-full text-xs font-bold inline-block",
        "COL-18": "bg-purple-300 text-purple-950 px-2.5 py-1 rounded-full text-xs font-bold inline-block",
        "COL-19": "bg-gray-400 text-gray-900 px-2.5 py-1 rounded-full text-xs font-bold inline-block"
    };
    return badgeMap[colorKey] || "bg-gray-200 text-gray-800 px-2.5 py-1 rounded-full text-xs font-bold inline-block";
}

function initTiendasSelect() {
    const selectTienda = document.getElementById("select-tienda-destino");
    if (!selectTienda) return;
    
    selectTienda.innerHTML = '<option value="">-- Seleccionar Tienda Destino --</option>';
    
    const storeNames = window.STORE_NAMES || {
        "TDA-01": "Tienda Santa Lucía",
        "TDA-02": "Tienda Generales Suplex",
        "TDA-03": "Tienda Generales Pasadizo",
        "TDA-04": "Tienda Aviación"
    };

    for (const [storeId, storeName] of Object.entries(storeNames)) {
        if (storeId.startsWith("TDA-")) {
            if (window.isStoreActive && !window.isStoreActive(storeId)) continue;
            const opt = document.createElement("option");
            opt.value = storeId;
            opt.textContent = storeName;
            selectTienda.appendChild(opt);
        }
    }
}

function getSystemModels() {
    let modelsList = JSON.parse(localStorage.getItem("escarlu_modelos")) || [];
    if (modelsList.length === 0) {
        modelsList = [
            { id_modelo: "MOD-001", tipo: "Polo", nombre: "Camisero MC", tallas: ["St", "L"] },
            { id_modelo: "MOD-002", tipo: "Polo", nombre: "Camisero ML", tallas: ["St", "L"] },
            { id_modelo: "MOD-003", tipo: "Polo", nombre: "Girasol MC", tallas: ["St", "L"] },
            { id_modelo: "MOD-004", tipo: "Polo", nombre: "Girasol ML", tallas: ["St", "L"] },
            { id_modelo: "MOD-005", tipo: "Polo", nombre: "Redondo MC", tallas: ["St", "L"] },
            { id_modelo: "MOD-006", tipo: "Polo", nombre: "Redondo ML", tallas: ["St", "L"] },
            { id_modelo: "MOD-007", tipo: "Polo", nombre: "Cuadrado MC", tallas: ["St", "L"] },
            { id_modelo: "MOD-008", tipo: "Polo", nombre: "Cuadrado ML", tallas: ["St", "L"] },
            { id_modelo: "MOD-009", tipo: "Polo", nombre: "Tania MC", tallas: ["St", "L"] },
            { id_modelo: "MOD-010", tipo: "Polo", nombre: "Tania ML", tallas: ["St", "L"] },
            { id_modelo: "MOD-011", tipo: "Polo", nombre: "Noemi MC", tallas: ["St", "L"] },
            { id_modelo: "MOD-012", tipo: "Polo", nombre: "Noemi ML", tallas: ["St", "L"] },
            { id_modelo: "MOD-013", tipo: "Polo", nombre: "Boton MC", tallas: ["St", "L"] },
            { id_modelo: "MOD-014", tipo: "Polo", nombre: "Boton ML", tallas: ["St", "L"] },
            { id_modelo: "MOD-015", tipo: "Short", nombre: "Short Pinza", tallas: ["S", "M", "L", "XL"] },
            { id_modelo: "MOD-016", tipo: "Short", nombre: "Short Boton", tallas: ["S", "M", "L", "XL"] },
            { id_modelo: "MOD-017", tipo: "Chompa", nombre: "Chompa Redondo", tallas: ["St", "L"] },
            { id_modelo: "MOD-018", tipo: "Chompa", nombre: "Chompa V", tallas: ["St", "L"] },
            { id_modelo: "MOD-019", tipo: "Buzo", nombre: "Buzo Normal", tallas: ["St", "L"] },
            { id_modelo: "MOD-020", tipo: "Polo", nombre: "Corazon MC", tallas: ["St", "L"] },
            { id_modelo: "MOD-021", tipo: "Polo", nombre: "Corazon ML", tallas: ["St", "L"] }
        ];
    }
    return modelsList;
}

function initTiposSelect() {
    const selectTipo = document.getElementById("select-tipo");
    if (!selectTipo) return;

    selectTipo.addEventListener("change", () => {
        updateModelosSelect();
    });
}

function updateModelosSelect() {
    const selectTipo = document.getElementById("select-tipo");
    const selectModelo = document.getElementById("select-modelo");
    if (!selectTipo || !selectModelo) return;

    const selectedTipo = selectTipo.value;
    selectModelo.innerHTML = "";

    if (!selectedTipo) {
        selectModelo.innerHTML = '<option value="">-- Seleccionar Tipo primero --</option>';
        selectModelo.disabled = true;
        updateTallasSelect();
        return;
    }

    selectModelo.disabled = false;
    selectModelo.innerHTML = '<option value="">-- Seleccionar Modelo --</option>';

    const allModels = getSystemModels();
    const filteredModels = allModels.filter(m => m.tipo.toLowerCase() === selectedTipo.toLowerCase());

    filteredModels.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id_modelo;
        opt.textContent = m.nombre;
        selectModelo.appendChild(opt);
    });

    selectModelo.addEventListener("change", () => {
        updateTallasSelect();
    });

    updateTallasSelect();
}

function updateTallasSelect() {
    const selectModelo = document.getElementById("select-modelo");
    const selectTalla = document.getElementById("select-talla");
    if (!selectModelo || !selectTalla) return;

    const modelKey = selectModelo.value;
    selectTalla.innerHTML = "";

    if (!modelKey) {
        selectTalla.innerHTML = '<option value="">-- Seleccionar Modelo primero --</option>';
        selectTalla.disabled = true;
        renderColorMatrix();
        return;
    }

    selectTalla.disabled = false;
    const allowedSizes = getAllowedSizesForModel(modelKey);
    allowedSizes.forEach(sz => {
        const opt = document.createElement("option");
        opt.value = sz;
        opt.textContent = sz;
        selectTalla.appendChild(opt);
    });

    if (allowedSizes.length > 0) {
        selectTalla.value = allowedSizes[0];
    }

    renderColorMatrix();
}

function renderColorMatrix() {
    const matrixContainer = document.getElementById("color-matrix-grid");
    const selectModelo = document.getElementById("select-modelo");
    const selectTalla = document.getElementById("select-talla");
    if (!matrixContainer) return;

    const modelKey = selectModelo?.value;
    const size = selectTalla?.value;

    if (!modelKey || !size) {
        matrixContainer.innerHTML = `
            <div class="col-span-full py-8 text-center text-on-surface-variant font-medium bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant/40">
                <span class="material-symbols-outlined text-3xl mb-1 text-on-surface-variant/60">palette</span>
                <p class="text-sm">Seleccione un Modelo y una Talla para cargar la Matriz Dinámica de Colores.</p>
            </div>
        `;
        return;
    }

    loadDespachoData();

    // Stock del almacén de la sesión para el modelo seleccionado
    const centralModelStock = invData[getOrigenAlmacen()]?.[modelKey] || {};
    
    // Determine colors registered in system or stock
    let systemColors = {};
    try {
        systemColors = JSON.parse(localStorage.getItem("escarlu_colores")) || COLOR_NAMES;
    } catch (e) {
        systemColors = COLOR_NAMES;
    }

    const colorEntries = Object.entries(systemColors);

    matrixContainer.innerHTML = "";

    let tabIndexCounter = 1;

    colorEntries.forEach(([colorKey, colorName]) => {
        const stockVal = centralModelStock[colorKey]?.[size] || 0;
        const isAvailable = stockVal > 0;

        const card = document.createElement("div");
        card.className = `p-2.5 rounded-xl border-2 transition-all flex flex-col gap-2 ${
            isAvailable 
                ? "bg-white border-[#F8C8D4] hover:border-[#C59B27] shadow-sm" 
                : "bg-surface-container-low border-outline-variant/30 opacity-75 cursor-not-allowed"
        }`;

        card.innerHTML = `
            <div class="flex flex-col gap-1">
                <span class="${getColorBadgeClass(colorKey)} text-[10px] px-2 py-0.5">${colorName}</span>
                <div class="flex items-center justify-between">
                    <span class="text-[9px] uppercase font-bold tracking-wider text-on-surface-variant">Stock</span>
                    <span class="text-[10px] font-bold ${isAvailable ? 'text-primary' : 'text-error'}">${stockVal} un.</span>
                </div>
            </div>
            <div class="flex items-center gap-1">
                <label class="text-[10px] font-bold text-on-surface shrink-0">Cant.:</label>
                <input 
                    type="number" 
                    id="qty-input-${colorKey}" 
                    data-color-key="${colorKey}"
                    data-color-name="${colorName}"
                    data-stock="${stockVal}"
                    min="0" 
                    max="${stockVal}"
                    placeholder="0" 
                    tabindex="${isAvailable ? tabIndexCounter++ : -1}"
                    ${!isAvailable ? 'disabled' : ''}
                    class="color-qty-input w-full h-8 px-1 border-2 border-outline-variant rounded-lg text-center font-bold text-sm bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all ${!isAvailable ? 'bg-gray-100 cursor-not-allowed opacity-50' : ''}"
                />
            </div>
        `;

        matrixContainer.appendChild(card);
    });

    // Add keydown and wheel listeners
    const inputs = matrixContainer.querySelectorAll(".color-qty-input");
    inputs.forEach((input, index) => {
        // Prevent mouse wheel from changing or clearing input value on scroll
        input.addEventListener("wheel", (e) => {
            e.preventDefault();
        }, { passive: false });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                // Find next enabled input
                let nextIndex = index + 1;
                while (nextIndex < inputs.length && inputs[nextIndex].disabled) {
                    nextIndex++;
                }
                if (nextIndex < inputs.length) {
                    inputs[nextIndex].focus();
                    inputs[nextIndex].select();
                } else {
                    document.getElementById("btn-add-to-guide")?.focus();
                }
            }
        });
        // Select input value on focus
        input.addEventListener("focus", () => input.select());
    });
}

function addSelectedColorsToGuide() {
    const selectTienda = document.getElementById("select-tienda-destino");
    const selectModelo = document.getElementById("select-modelo");
    const selectTalla = document.getElementById("select-talla");

    const storeId = selectTienda?.value;
    const modelKey = selectModelo?.value;
    const size = selectTalla?.value;

    if (!storeId) {
        alert("Por favor, seleccione primero la Tienda Destino.");
        selectTienda?.focus();
        return;
    }

    if (!modelKey || !size) {
        alert("Por favor, seleccione un Modelo y una Talla.");
        return;
    }

    const modelName = MODEL_NAMES[modelKey] || modelKey;

    const matrixInputs = document.querySelectorAll(".color-qty-input");
    let addedCount = 0;
    let errors = [];

    matrixInputs.forEach(input => {
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            const colorKey = input.getAttribute("data-color-key");
            const colorName = input.getAttribute("data-color-name");
            const availableStock = parseInt(input.getAttribute("data-stock")) || 0;

            if (qty > availableStock) {
                errors.push(`Stock insuficiente para ${modelName} (${colorName} - ${size}). Disponible: ${availableStock}, Ingresado: ${qty}`);
                return;
            }

            // Check if item already exists in current guide
            const existingIndex = guiaItems.findIndex(item => 
                item.modelKey === modelKey && item.size === size && item.colorKey === colorKey
            );

            if (existingIndex >= 0) {
                const totalNewQty = guiaItems[existingIndex].qty + qty;
                if (totalNewQty > availableStock) {
                    errors.push(`La cantidad total (${totalNewQty}) supera el stock disponible (${availableStock}) de ${colorName}.`);
                } else {
                    guiaItems[existingIndex].qty = totalNewQty;
                    addedCount++;
                }
            } else {
                guiaItems.push({
                    id: `ITEM-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                    modelKey,
                    modelName,
                    size,
                    colorKey,
                    colorName,
                    qty,
                    availableStock
                });
                addedCount++;
            }

            input.value = ""; // Clear input field
        }
    });

    if (errors.length > 0) {
        alert(errors.join("\n"));
    }

    if (addedCount > 0) {
        renderGuideTable();
        showDespachoToast(`Se agregaron ${addedCount} lote(s) de prendas al carrito.`);
    } else if (errors.length === 0) {
        alert("Ingrese una cantidad mayor a 0 en al menos un color para agregar al carrito.");
    }
}

function renderGuideTable() {
    const tbody = document.getElementById("guide-items-tbody");
    const counterEl = document.getElementById("giant-total-counter");
    const confirmBtn = document.getElementById("btn-confirm-dispatch");
    if (!tbody) return;

    tbody.innerHTML = "";
    let totalPrendas = 0;

    if (guiaItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="py-12 text-center text-on-surface-variant font-medium">
                    <span class="material-symbols-outlined text-4xl block mb-2 text-on-surface-variant/40">shopping_bag</span>
                    No hay prendas agregadas a la guía de despacho.
                </td>
            </tr>
        `;
        if (counterEl) {
            counterEl.textContent = "0 Prendas";
            counterEl.className = "text-3xl sm:text-4xl font-headline-md font-extrabold text-[#C59B27] tracking-tight";
        }
        if (confirmBtn) {
            confirmBtn.disabled = true;
        }
        return;
    }

    guiaItems.forEach((item, index) => {
        totalPrendas += item.qty;

        const tr = document.createElement("tr");
        tr.className = "hover:bg-surface-container-low transition-colors";
        tr.innerHTML = `
            <td class="px-6 py-4">
                <div class="font-bold text-sm text-on-surface">${item.modelName}</div>
                <div class="text-xs text-on-surface-variant">REF: ESC-2026-${item.modelKey}</div>
            </td>
            <td class="px-4 py-4 text-center font-bold text-sm">${item.size}</td>
            <td class="px-4 py-4">
                <span class="${getColorBadgeClass(item.colorKey)}">${item.colorName}</span>
            </td>
            <td class="px-4 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                    <button type="button" onclick="adjustItemQty(${index}, -1)" class="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center font-bold text-sm transition-colors">-</button>
                    <span class="font-extrabold text-base px-2 text-primary">${item.qty}</span>
                    <button type="button" onclick="adjustItemQty(${index}, 1)" class="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center font-bold text-sm transition-colors">+</button>
                </div>
            </td>
            <td class="px-6 py-4 text-right">
                <button type="button" onclick="removeGuideItem(${index})" class="p-2 text-error hover:bg-red-50 rounded-lg transition-colors" title="Eliminar ítem">
                    <span class="material-symbols-outlined text-xl">delete</span>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (counterEl) {
        const grouped = {};
        guiaItems.forEach(item => {
            const key = `${item.modelName}|${item.size}`;
            grouped[key] = (grouped[key] || 0) + item.qty;
        });

        counterEl.innerHTML = Object.entries(grouped)
            .map(([key, qty]) => {
                const [model, size] = key.split('|');
                return `<div class="text-sm sm:text-base font-semibold text-on-surface">${model} (${size}) — <span class="text-[#C59B27] font-extrabold text-base sm:text-lg">${qty} unids</span></div>`;
            })
            .join("");
        counterEl.className = "flex flex-col items-end gap-1 text-right";
    }

    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.classList.remove("cursor-not-allowed");
    }
}

function adjustItemQty(index, delta) {
    if (guiaItems[index]) {
        const newQty = guiaItems[index].qty + delta;
        if (newQty <= 0) {
            removeGuideItem(index);
        } else if (newQty > guiaItems[index].availableStock) {
            alert(`No puede superar el stock disponible de ${guiaItems[index].availableStock} unidades.`);
        } else {
            guiaItems[index].qty = newQty;
            renderGuideTable();
        }
    }
}

function removeGuideItem(index) {
    if (guiaItems[index]) {
        guiaItems.splice(index, 1);
        renderGuideTable();
    }
}

function clearGuide() {
    guiaItems = [];
    renderGuideTable();
}

function showConfirmModal(destStoreName, totalPrendas, itemCount) {
    return new Promise((resolve) => {
        // Remove any existing modal
        const existing = document.getElementById("custom-confirm-modal");
        if (existing) existing.remove();

        const overlay = document.createElement("div");
        overlay.id = "custom-confirm-modal";
        overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 9999;
            background: rgba(0,0,0,0.35); backdrop-filter: blur(4px);
            display: flex; align-items: center; justify-content: center;
            animation: fadeInOverlay 0.2s ease;
        `;
        overlay.innerHTML = `
            <div style="
                background: #fff; border-radius: 20px;
                padding: 32px 28px; max-width: 420px; width: 90%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.18);
                animation: slideUpModal 0.25s ease;
                font-family: inherit;
            ">
                <div style="display:flex; align-items:center; gap:14px; margin-bottom:18px;">
                    <div style="
                        width:48px; height:48px; border-radius:50%;
                        background:#FFF0F3; border:2px solid #F8C8D4;
                        display:flex; align-items:center; justify-content:center;
                        flex-shrink:0;
                    ">
                        <span class="material-symbols-outlined" style="color:#C59B27; font-size:26px;">local_shipping</span>
                    </div>
                    <div>
                        <div style="font-size:17px; font-weight:800; color:#1a1a1a; margin-bottom:2px;">Confirmar Despacho</div>
                        <div style="font-size:12px; color:#888; font-weight:600;">Esta acción no se puede deshacer</div>
                    </div>
                </div>
                <div style="
                    background:#FAFAFA; border:1px solid #F0E8D5;
                    border-radius:12px; padding:14px 16px; margin-bottom:24px;
                ">
                    <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #f0f0f0;">
                        <span style="font-size:12px; color:#888; font-weight:700; text-transform:uppercase;">Destino</span>
                        <span style="font-size:13px; font-weight:800; color:#1a1a1a;">${destStoreName}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #f0f0f0;">
                        <span style="font-size:12px; color:#888; font-weight:700; text-transform:uppercase;">Total Prendas</span>
                        <span style="font-size:13px; font-weight:800; color:#C59B27;">${totalPrendas} un.</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:5px 0;">
                        <span style="font-size:12px; color:#888; font-weight:700; text-transform:uppercase;">Ítems en Guía</span>
                        <span style="font-size:13px; font-weight:800; color:#1a1a1a;">${itemCount} modelo(s)</span>
                    </div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button id="modal-btn-cancel" style="
                        flex:1; height:44px; border-radius:12px;
                        border:2px solid #F8C8D4; background:#fff;
                        color:#1a1a1a; font-weight:700; font-size:13px;
                        cursor:pointer; transition:all 0.15s;
                        font-family:inherit;
                    ">Cancelar</button>
                    <button id="modal-btn-confirm" style="
                        flex:1; height:44px; border-radius:12px;
                        border:none; background:#C59B27;
                        color:#1a1a1a; font-weight:800; font-size:13px;
                        cursor:pointer; transition:all 0.15s;
                        box-shadow:0 4px 14px rgba(197,155,39,0.4);
                        font-family:inherit;
                        display:flex; align-items:center; justify-content:center; gap:6px;
                    ">
                        <span class="material-symbols-outlined" style="font-size:18px;">check_circle</span>
                        Sí, Despachar
                    </button>
                </div>
            </div>
            <style>
                @keyframes fadeInOverlay { from{opacity:0} to{opacity:1} }
                @keyframes slideUpModal { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
                #modal-btn-cancel:hover { background:#FFF0F3 !important; }
                #modal-btn-confirm:hover { background:#b08920 !important; color:#fff !important; }
            </style>
        `;

        document.body.appendChild(overlay);

        document.getElementById("modal-btn-confirm").addEventListener("click", () => {
            overlay.remove();
            resolve(true);
        });
        document.getElementById("modal-btn-cancel").addEventListener("click", () => {
            overlay.remove();
            resolve(false);
        });
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) { overlay.remove(); resolve(false); }
        });
    });
}

async function confirmAndProcessDispatch() {
    const selectTienda = document.getElementById("select-tienda-destino");
    const destStoreId = selectTienda?.value;

    if (!destStoreId) {
        alert("Por favor seleccione la Tienda Destino.");
        selectTienda?.focus();
        return;
    }

    if (guiaItems.length === 0) {
        alert("La guía de despacho está vacía.");
        return;
    }

    const storeNames = window.STORE_NAMES || {};
    const destStoreName = storeNames[destStoreId] || destStoreId;

    const totalPrendas = guiaItems.reduce((sum, item) => sum + item.qty, 0);

    const confirmed = await showConfirmModal(destStoreName, totalPrendas, guiaItems.length);
    if (!confirmed) return;

    const confirmBtn = document.getElementById("btn-confirm-dispatch");
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-xl">sync</span> Procesando Despacho...`;
    }

    try {
        loadDespachoData();

        let tiendaStock = {};
        try {
            const tStr = localStorage.getItem("escarlu_tienda_stock");
            tiendaStock = tStr ? JSON.parse(tStr) : {};
        } catch (e) {
            tiendaStock = {};
        }

        const user = getCurrentUser();
        const userLabel = user ? user.label : "Encargado de Almacén";
        const dateNow = new Date().toISOString();
        const originStore = getOrigenAlmacen();

        const newRequests = [];
        const newMovements = [];
        const dbStockRecords = [];

        for (const item of guiaItems) {
            const { modelKey, colorKey, size, qty } = item;
            const tallaId = TALLA_KEYS[size] || "TAL-03";

            // 1. Deduct from the session warehouse (originStore) only
            if (!invData[originStore]) invData[originStore] = {};
            if (!invData[originStore][modelKey]) invData[originStore][modelKey] = {};
            if (!invData[originStore][modelKey][colorKey]) invData[originStore][modelKey][colorKey] = {};
            
            const currentCentral = invData[originStore][modelKey][colorKey][size] || 0;
            const newCentral = Math.max(0, currentCentral - qty);
            invData[originStore][modelKey][colorKey][size] = newCentral;

            dbStockRecords.push({
                id_stock: `STK-${originStore}-${modelKey}-${colorKey}-${tallaId}`,
                id_sede: originStore,
                id_modelo: modelKey,
                id_color: colorKey,
                id_talla: tallaId,
                cantidad: newCentral,
                ultima_actualizacion: dateNow
            });

            // 2. Add to Destination Store
            if (!invData[destStoreId]) invData[destStoreId] = {};
            if (!invData[destStoreId][modelKey]) invData[destStoreId][modelKey] = {};
            if (!invData[destStoreId][modelKey][colorKey]) invData[destStoreId][modelKey][colorKey] = {};

            const currentDest = invData[destStoreId][modelKey][colorKey][size] || 0;
            const newDest = currentDest + qty;
            invData[destStoreId][modelKey][colorKey][size] = newDest;

            dbStockRecords.push({
                id_stock: `STK-${destStoreId}-${modelKey}-${colorKey}-${tallaId}`,
                id_sede: destStoreId,
                id_modelo: modelKey,
                id_color: colorKey,
                id_talla: tallaId,
                cantidad: newDest,
                ultima_actualizacion: dateNow
            });

            // Update consolidated tiendaStock
            if (!tiendaStock[destStoreId]) tiendaStock[destStoreId] = {};
            if (!tiendaStock[destStoreId][modelKey]) tiendaStock[destStoreId][modelKey] = {};
            tiendaStock[destStoreId][modelKey][size] = (tiendaStock[destStoreId][modelKey][size] || 0) + qty;

            // 3. Create Request & Movement records
            const reqId = `REQ-${Math.floor(100000 + Math.random() * 900000)}`;
            const reqRecord = {
                id: reqId,
                type: "traspaso",
                origin: originStore,
                destination: destStoreId,
                model: modelKey,
                color: colorKey,
                size: size,
                qty: qty,
                status: "completado",
                date: dateNow
            };
            reqsData.push(reqRecord);
            newRequests.push(reqRecord);

            const movId = `MOV-${Date.now()}-${Math.floor(Math.random()*1000)}`;
            const movRecord = {
                id: movId,
                fecha_hora: dateNow,
                origen_id: originStore,
                destino_id: destStoreId,
                modelo_id: modelKey,
                color: colorKey,
                talla: size,
                cantidad: qty,
                tipo: "despacho_tienda",
                user: userLabel,
                editado: false
            };
            movsData.push(movRecord);
            newMovements.push(movRecord);
        }

        // Save to LocalStorage (triggers window.localStorage.setItem overrides & storage events)
        localStorage.setItem("escarlu_inventory", JSON.stringify(invData));
        localStorage.setItem("escarlu_tienda_stock", JSON.stringify(tiendaStock));
        localStorage.setItem("escarlu_requests", JSON.stringify(reqsData));
        localStorage.setItem("escarlu_movimientos", JSON.stringify(movsData));

        // Direct batch upserts to Supabase DB for instant cloud sync
        const client = getSupabaseClient();
        if (client) {
            if (dbStockRecords.length > 0) {
                await client.from("stock").upsert(dbStockRecords);
            }
            if (newRequests.length > 0) {
                const reqRecordsSupabase = newRequests.map(req => ({
                    id_solicitud: req.id,
                    tipo: "traspaso",
                    id_sede_origen: originStore,
                    id_sede_destino: req.destination,
                    id_modelo: req.model,
                    id_color: req.color,
                    id_talla: TALLA_KEYS[req.size] || "TAL-03",
                    cantidad: req.qty,
                    estado: "completado",
                    fecha_solicitud: req.date
                }));
                await client.from("solicitudes_traspaso").upsert(reqRecordsSupabase);
            }
            if (newMovements.length > 0) {
                const movRecordsSupabase = newMovements.map(mov => ({
                    id: mov.id,
                    fecha_hora: mov.fecha_hora,
                    origen_id: mov.origen_id,
                    destino_id: mov.destino_id,
                    modelo_id: mov.modelo_id,
                    color_id: mov.color,
                    talla: mov.talla,
                    cantidad: mov.cantidad,
                    tipo: mov.tipo,
                    user_label: mov.user,
                    editado: false
                }));
                await client.from("movimientos_inventario").upsert(movRecordsSupabase);
            }
        }

        // Reset local guide items draft
        guiaItems = [];
        renderGuideTable();
        renderColorMatrix();

        showDespachoToast(`Guía de Despacho procesada con éxito. ${totalPrendas} prendas enviadas a ${destStoreName}.`);

    } catch (err) {
        console.error("Error processing dispatch:", err);
        alert("Ocurrió un error al procesar el despacho: " + err.message);
    } finally {
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = `<span class="material-symbols-outlined text-2xl">local_shipping</span> Confirmar y Despachar Guía Completa`;
        }
    }
}

function showDespachoToast(text) {
    let toast = document.getElementById("toast-despacho");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-despacho";
        toast.className = "fixed bottom-6 right-6 bg-dark-text text-white px-6 py-4 rounded-2xl shadow-2xl z-[9999] flex items-center gap-3 transition-all duration-300 transform translate-y-24 border border-[#C59B27]";
        toast.innerHTML = `
            <span class="material-symbols-outlined text-[#C59B27] text-2xl">check_circle</span>
            <p class="font-bold text-sm font-body-md"></p>
        `;
        document.body.appendChild(toast);
    }

    toast.querySelector("p").textContent = text;
    toast.classList.remove("translate-y-24");
    setTimeout(() => {
        toast.classList.add("translate-y-24");
    }, 4500);
}

document.addEventListener("DOMContentLoaded", () => {
    loadDespachoData();
    initTiendasSelect();
    initTiposSelect();
    updateModelosSelect();

    const selectTalla = document.getElementById("select-talla");
    if (selectTalla) {
        selectTalla.addEventListener("change", renderColorMatrix);
    }

    const btnAdd = document.getElementById("btn-add-to-guide");
    if (btnAdd) {
        btnAdd.addEventListener("click", addSelectedColorsToGuide);
    }

    const btnConfirm = document.getElementById("btn-confirm-dispatch");
    if (btnConfirm) {
        btnConfirm.addEventListener("click", confirmAndProcessDispatch);
    }

    const btnClear = document.getElementById("btn-clear-guide");
    if (btnClear) {
        btnClear.addEventListener("click", () => {
            if (guiaItems.length > 0 && confirm("¿Limpiar todos los ítems de la guía actual?")) {
                clearGuide();
            }
        });
    }

    renderColorMatrix();
    renderGuideTable();
});
