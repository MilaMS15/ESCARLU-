// WhatsApp Owner Config
const OWNER_PHONE = "51936197969";

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    renderSideNav("cajadueno");

    // Set default month to current month/year (YYYY-MM)
    const periodFilter = document.getElementById("filter-period");
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    periodFilter.value = `${yyyy}-${mm}`;

    // Initialize lists and KPIs
    renderFinanceDashboard();

    // Listen for filter changes
    periodFilter.addEventListener('change', renderFinanceDashboard);

    // Bind sede filter
    const sedeFilter = document.getElementById("filter-sede");
    if (sedeFilter) {
        sedeFilter.addEventListener('change', renderFinanceDashboard);
    }

    // Bind export button
    const exportBtn = document.getElementById("btnExportarExcel");
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToExcel);
    }

    // Setup real-time storage sync
    window.addEventListener('storage', (e) => {
        if (!e.key || e.key === 'escarlu_sales' || e.key === 'escarlu_expenses') {
            renderFinanceDashboard();
        }
    });
});

function renderFinanceDashboard() {
    const selectedPeriod = document.getElementById("filter-period").value; // YYYY-MM
    if (!selectedPeriod) return;

    const selectedSede = document.getElementById("filter-sede")?.value || "all";

    const allSales = JSON.parse(localStorage.getItem("escarlu_sales")) || [];
    const allExpenses = JSON.parse(localStorage.getItem("escarlu_expenses")) || [];

    // 1. Filter Sales for the selected month (Approved sales only) + sede
    const approvedSales = allSales.filter(sale => {
        if (!sale.date) return false;
        const matchesPeriod = sale.date.startsWith(selectedPeriod) && sale.status === 'aprobado';
        const matchesSede = selectedSede === "all" || sale.storeId === selectedSede;
        return matchesPeriod && matchesSede;
    });

    // 2. Filter Expenses for the selected month + sede
    // Egresos sin storeId son gastos generales: se muestran siempre (en "all") o nunca al filtrar por tienda específica
    const monthlyExpenses = allExpenses.filter(exp => {
        if (!exp.date) return false;
        const matchesPeriod = exp.date.startsWith(selectedPeriod);
        if (!matchesPeriod) return false;
        if (selectedSede === "all") return true;
        // Si el egreso tiene storeId vacío es un gasto general — se incluye en todas
        if (!exp.storeId) return true;
        return exp.storeId === selectedSede;
    });

    // 3. Calculate KPIs
    const totalIngresos = approvedSales.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
    const totalEgresos = monthlyExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const utilidad = totalIngresos - totalEgresos;

    let ingresosEfectivo = 0;
    let ingresosDigital = 0;
    approvedSales.forEach(s => {
        const amt = parseFloat(s.amount || 0);
        if (s.method && s.method.toLowerCase() === 'efectivo') {
            ingresosEfectivo += amt;
        } else {
            ingresosDigital += amt;
        }
    });

    // Render KPIs
    document.getElementById("kpi-ingresos").textContent = `S/ ${totalIngresos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById("kpi-ingresos-efectivo").textContent = `Efectivo: S/ ${ingresosEfectivo.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById("kpi-ingresos-yape").textContent = `Yape/Digital: S/ ${ingresosDigital.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById("kpi-egresos").textContent = `S/ ${totalEgresos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    const kpiUtilidad = document.getElementById("kpi-utilidad");
    kpiUtilidad.textContent = `S/ ${utilidad.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (utilidad >= 0) {
        kpiUtilidad.className = "text-3xl font-black text-primary mt-2";
    } else {
        kpiUtilidad.className = "text-3xl font-black text-error mt-2";
    }

    // 4. Render Yape Verification Panel
    renderPendingYapes();

    // 5. Render Movements Table
    const movements = [];

    // Add Sales as Ingresos
    approvedSales.forEach(sale => {
        movements.push({
            date: sale.date,
            category: "Venta Tienda",
            concept: `Venta a ${sale.client || 'Cliente'} (${sale.method.toUpperCase()})`,
            store: STORE_NAMES[sale.storeId] || sale.storeId,
            amount: parseFloat(sale.amount || 0),
            type: 'ingreso'
        });
    });

    // Add Expenses as Egresos
    monthlyExpenses.forEach(exp => {
        movements.push({
            id: exp.id,
            date: exp.date.includes('T') ? exp.date : `${exp.date}T00:00:00`,
            category: exp.category.charAt(0).toUpperCase() + exp.category.slice(1),
            concept: exp.description,
            store: exp.storeId ? (STORE_NAMES[exp.storeId] || exp.storeId) : "General / Almacén",
            amount: parseFloat(exp.amount || 0),
            type: 'egreso'
        });
    });

    // Sort movements by date descending
    movements.sort((a, b) => new Date(b.date) - new Date(a.date));

    const tbody = document.getElementById("movements-table-body");
    const emptyDiv = document.getElementById("movements-empty");
    tbody.innerHTML = "";

    if (movements.length === 0) {
        emptyDiv.classList.remove("hidden");
        tbody.closest("table").classList.add("hidden");
    } else {
        emptyDiv.classList.add("hidden");
        tbody.closest("table").classList.remove("hidden");

        movements.forEach(m => {
            const tr = document.createElement("tr");
            tr.className = "hover:bg-surface-container-low transition-colors";

            const dateObj = new Date(m.date);
            const dateStr = isNaN(dateObj) ? m.date.slice(0,10) : dateObj.toLocaleString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });

            const amtClass = m.type === 'ingreso' ? 'text-green-600 font-bold text-right' : 'text-secondary font-bold text-right';
            const amtSign = m.type === 'ingreso' ? `+S/ ${m.amount.toFixed(2)}` : `-S/ ${m.amount.toFixed(2)}`;

            const actionCell = m.type === 'egreso' ? `
                <td class="py-3.5 px-4 text-center">
                    <button onclick="deleteEgreso('${m.id}')" title="Eliminar egreso" class="text-error hover:bg-error-container/20 p-1.5 rounded-lg transition-colors inline-flex items-center justify-center">
                        <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                </td>
            ` : `<td class="py-3.5 px-4 text-center text-on-surface-variant/40">-</td>`;

            tr.innerHTML = `
                <td class="py-3.5 px-4 text-on-surface-variant font-medium">${dateStr}</td>
                <td class="py-3.5 px-4 font-bold text-on-surface">${m.category}</td>
                <td class="py-3.5 px-4 text-on-surface-variant font-medium">${m.concept}</td>
                <td class="py-3.5 px-4"><span class="px-2.5 py-0.5 bg-primary-container/20 text-primary text-xs font-bold rounded-full">${m.store}</span></td>
                <td class="py-3.5 px-4 ${amtClass}">${amtSign}</td>
                ${actionCell}
            `;
            tbody.appendChild(tr);
        });
    }
}

function renderPendingYapes() {
    const pendingContainer = document.getElementById("yapes-list-container");
    if (!pendingContainer) return;

    const allSales = JSON.parse(localStorage.getItem("escarlu_sales")) || [];
    const pendingSales = allSales.filter(s => s.status === 'pendiente');

    // Update badge count
    const badge = pendingContainer.closest('.bg-white').querySelector('.bg-error-container') || pendingContainer.closest('.bg-white').querySelector('.bg-green-100');
    if (badge) {
        if (pendingSales.length === 0) {
            badge.className = "bg-green-100 text-green-800 px-4 py-1 rounded-full font-label-md text-xs font-bold";
            badge.textContent = "0 Pendientes";
        } else {
            badge.className = "bg-error-container text-on-error-container px-4 py-1 rounded-full font-label-md text-xs font-bold";
            badge.textContent = `${pendingSales.length} Pendientes`;
        }
    }

    pendingContainer.innerHTML = "";

    if (pendingSales.length === 0) {
        pendingContainer.innerHTML = `
            <div class="text-center py-8 text-on-surface-variant font-medium text-sm">
                No hay yapes ni transferencias pendientes de verificar.
            </div>
        `;
        return;
    }

    pendingSales.forEach(sale => {
        const div = document.createElement("div");
        div.className = "flex items-center gap-2 p-2.5 rounded-xl hover:bg-surface-container transition-colors border border-outline-variant/30";
        
        const storeName = STORE_NAMES[sale.storeId] || sale.storeId;
        const timeStr = sale.date ? new Date(sale.date).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : "";

        div.innerHTML = `
            <div class="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-white shrink-0">
                <span class="material-symbols-outlined text-xl">image</span>
            </div>
            <div class="flex-1 min-w-0">
                <p class="font-bold text-xs text-on-surface truncate">S/ ${parseFloat(sale.amount).toFixed(2)}</p>
                <p class="text-[10px] text-on-surface-variant font-medium leading-tight truncate">${storeName}</p>
                <p class="text-[9px] text-on-surface-variant opacity-85 leading-none truncate">Ref: ${sale.reference || 'N/A'} • ${timeStr}</p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
                <button onclick="approveYape('${sale.id}')" class="px-2.5 py-1.5 bg-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:shadow active:scale-95 transition-all">
                    Aprobar
                </button>
                <button onclick="rejectYape('${sale.id}')" class="w-7 h-7 flex items-center justify-center border border-error text-error rounded-lg hover:bg-error/5 active:scale-95 transition-colors">
                    <span class="material-symbols-outlined text-base">close</span>
                </button>
            </div>
        `;
        pendingContainer.appendChild(div);
    });
}

function approveYape(id) {
    const allSales = JSON.parse(localStorage.getItem("escarlu_sales")) || [];
    const saleIndex = allSales.findIndex(s => s.id === id);
    if (saleIndex === -1) return;

    allSales[saleIndex].status = "aprobado";
    localStorage.setItem("escarlu_sales", JSON.stringify(allSales));
    
    alert("Pago verificado y aprobado.");
    renderFinanceDashboard();
}

function rejectYape(id) {
    if (!confirm("¿Seguro de rechazar y anular este pago pendiente?")) return;

    const allSales = JSON.parse(localStorage.getItem("escarlu_sales")) || [];
    const saleIndex = allSales.findIndex(s => s.id === id);
    if (saleIndex === -1) return;

    allSales[saleIndex].status = "rechazado";
    localStorage.setItem("escarlu_sales", JSON.stringify(allSales));

    alert("Pago rechazado y eliminado del balance.");
    renderFinanceDashboard();
}

// Modal Control
function openEgresoModal() {
    const modal = document.getElementById("egreso-modal");
    modal.classList.remove("hidden");
    setTimeout(() => {
        modal.classList.add("opacity-100");
        modal.firstElementChild.classList.remove("scale-95");
        modal.firstElementChild.classList.add("scale-100");
    }, 10);
    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById("egreso-fecha").value = todayStr;
}

function closeEgresoModal() {
    const modal = document.getElementById("egreso-modal");
    modal.classList.remove("opacity-100");
    modal.firstElementChild.classList.remove("scale-100");
    modal.firstElementChild.classList.add("scale-95");
    setTimeout(() => {
        modal.classList.add("hidden");
        document.getElementById("egreso-concepto").value = "";
        document.getElementById("egreso-monto").value = "";
    }, 200);
}

function saveEgreso() {
    const concepto = document.getElementById("egreso-concepto").value.trim();
    const categoria = document.getElementById("egreso-categoria").value;
    const monto = parseFloat(document.getElementById("egreso-monto").value);
    const fecha = document.getElementById("egreso-fecha").value;

    if (!concepto || isNaN(monto) || monto <= 0 || !fecha) {
        alert("Por favor complete todos los campos obligatorios correctamente.");
        return;
    }

    const allExpenses = JSON.parse(localStorage.getItem("escarlu_expenses")) || [];
    const newExpense = {
        id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
        description: concepto,
        category: categoria,
        amount: monto,
        storeId: "",  // Gasto general (sin sede específica)
        date: fecha
    };

    allExpenses.push(newExpense);
    localStorage.setItem("escarlu_expenses", JSON.stringify(allExpenses));

    // Cambiar el filtro de mes al periodo del egreso para mostrarlo al instante
    const expenseMonth = fecha.substring(0, 7);
    document.getElementById("filter-period").value = expenseMonth;

    closeEgresoModal();
    alert("Gasto/Egreso registrado correctamente.");
    renderFinanceDashboard();
}

// Function to export to Excel using SheetJS
function exportToExcel() {
    const selectedPeriod = document.getElementById("filter-period").value; // YYYY-MM
    if (!selectedPeriod) {
        alert("Por favor seleccione un período.");
        return;
    }

    const selectedSede = document.getElementById("filter-sede")?.value || "all";
    const selectedSedeName = selectedSede === "all"
        ? "Todas las Tiendas y Almacén"
        : (STORE_NAMES[selectedSede] || selectedSede);

    const allSales = JSON.parse(localStorage.getItem("escarlu_sales")) || [];
    const allExpenses = JSON.parse(localStorage.getItem("escarlu_expenses")) || [];

    // Filter approved sales by period + sede
    const approvedSales = allSales.filter(sale => {
        if (!sale.date) return false;
        const matchesPeriod = sale.date.startsWith(selectedPeriod) && sale.status === 'aprobado';
        const matchesSede = selectedSede === "all" || sale.storeId === selectedSede;
        return matchesPeriod && matchesSede;
    });

    // Filter expenses by period + sede
    const monthlyExpenses = allExpenses.filter(exp => {
        if (!exp.date) return false;
        const matchesPeriod = exp.date.startsWith(selectedPeriod);
        const matchesSede = selectedSede === "all" || exp.storeId === selectedSede;
        return matchesPeriod && matchesSede;
    });

    // Calculate KPIs
    const totalIngresos = approvedSales.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
    const totalEgresos = monthlyExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const utilidad = totalIngresos - totalEgresos;

    let ingresosEfectivo = 0;
    let ingresosDigital = 0;
    approvedSales.forEach(s => {
        const amt = parseFloat(s.amount || 0);
        if (s.method && s.method.toLowerCase() === 'efectivo') {
            ingresosEfectivo += amt;
        } else {
            ingresosDigital += amt;
        }
    });

    // Gather movements
    const movements = [];
    approvedSales.forEach(sale => {
        movements.push({
            date: sale.date,
            category: "Venta Tienda",
            concept: `Venta a ${sale.client || 'Cliente'} (${sale.method.toUpperCase()})`,
            store: STORE_NAMES[sale.storeId] || sale.storeId,
            amount: parseFloat(sale.amount || 0),
            type: 'ingreso'
        });
    });

    monthlyExpenses.forEach(exp => {
        movements.push({
            date: exp.date.includes('T') ? exp.date : `${exp.date}T00:00:00`,
            category: exp.category.charAt(0).toUpperCase() + exp.category.slice(1),
            concept: exp.description,
            store: exp.storeId ? (STORE_NAMES[exp.storeId] || exp.storeId) : "General / Almacén",
            amount: parseFloat(exp.amount || 0),
            type: 'egreso'
        });
    });

    // Sort movements by date descending
    movements.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Create Worksheet data
    const ws_data = [
        ["REPORTE DE FLUJO DE CAJA - ESCARLÚ"],
        ["Periodo:", selectedPeriod],
        ["Sede:", selectedSedeName],
        [],
        ["INDICADORES PRINCIPALES"],
        ["TOTAL INGRESOS (Efectivo y Digital)", { v: totalIngresos, t: 'n', z: '"S/" #,##0.00' }],
        ["  Efectivo", { v: ingresosEfectivo, t: 'n', z: '"S/" #,##0.00' }],
        ["  Yape / Digital", { v: ingresosDigital, t: 'n', z: '"S/" #,##0.00' }],
        ["TOTAL EGRESOS", { v: totalEgresos, t: 'n', z: '"S/" #,##0.00' }],
        ["BALANCE NETO", { v: utilidad, t: 'n', z: '"S/" #,##0.00;[Red]-"S/" #,##0.00' }],
        [],
        [],
        ["ÚLTIMOS MOVIMIENTOS"],
        ["FECHA/HORA", "SEDE", "CONCEPTO / CATEGORÍA", "MONTO"]
    ];

    movements.forEach(m => {
        const dateObj = new Date(m.date);
        const dateStr = isNaN(dateObj) 
            ? m.date.slice(0, 10) 
            : dateObj.toLocaleString('es-PE', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });

        const displayAmount = m.type === 'ingreso' ? m.amount : -m.amount;

        ws_data.push([
            dateStr,
            m.store,
            `${m.category} - ${m.concept}`,
            { v: displayAmount, t: 'n', z: '"S/" #,##0.00;[Red]-"S/" #,##0.00' }
        ]);
    });

    // Create Workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Set Column Widths
    ws['!cols'] = [
        { wch: 22 }, // FECHA/HORA
        { wch: 25 }, // SEDE
        { wch: 55 }, // CONCEPTO / CATEGORÍA
        { wch: 18 }  // MONTO
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Flujo de Caja");

    // Save File — nombre dinámico con período + sede
    const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    const [yr, mo] = selectedPeriod.split("-");
    const periodoFilename = `${meses[parseInt(mo, 10) - 1]}_${yr}`;
    const sedeFilename = selectedSede === "all" ? "TodasLasSedes" : (STORE_NAMES[selectedSede] || selectedSede).replace(/\s+/g, "_");
    XLSX.writeFile(wb, `Reporte_Flujo_Caja_ESCARLU_${periodoFilename}_${sedeFilename}.xlsx`);
}

function deleteEgreso(idGasto) {
    console.log("Iniciando eliminación de egreso con ID:", idGasto);
    const modal = document.getElementById("delete-confirm-modal");
    const btnConfirm = document.getElementById("btn-confirm-delete");
    const btnCancel = document.getElementById("btn-cancel-delete");

    if (!modal) {
        if (confirm("¿Estás seguro de eliminar este egreso?")) {
            executeDeleteEgreso(idGasto);
        }
        return;
    }

    modal.classList.remove("hidden");

    btnCancel.onclick = () => {
        modal.classList.add("hidden");
    };

    btnConfirm.onclick = async () => {
        modal.classList.add("hidden");
        await executeDeleteEgreso(idGasto);
    };
}

async function executeDeleteEgreso(idGasto) {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;

    // 1. Eliminar en Supabase si está disponible
    if (client) {
        try {
            const { error } = await client
                .from('gastos')
                .delete()
                .eq('id_gasto', idGasto);

            if (error) {
                console.error("Error eliminando egreso de Supabase:", error);
            }
        } catch (e) {
            console.error("Excepción al eliminar egreso en Supabase:", e);
        }
    }

    // 2. Eliminar de localStorage
    const allExpenses = JSON.parse(localStorage.getItem("escarlu_expenses")) || [];
    const updatedExpenses = allExpenses.filter(exp => exp.id !== idGasto);
    localStorage.setItem("escarlu_expenses", JSON.stringify(updatedExpenses));

    // 3. Recargar dashboard (recalcula TOTAL EGRESOS, BALANCE NETO y actualiza la tabla)
    renderFinanceDashboard();
}

// Expose functions globally for onclick and console accessibility
window.renderFinanceDashboard = renderFinanceDashboard;
window.renderPendingYapes = renderPendingYapes;
window.approveYape = approveYape;
window.rejectYape = rejectYape;
window.openEgresoModal = openEgresoModal;
window.closeEgresoModal = closeEgresoModal;
window.saveEgreso = saveEgreso;
window.exportToExcel = exportToExcel;
window.deleteEgreso = deleteEgreso;
