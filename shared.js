// Base de datos simulada y utilidades compartidas - ESCARLÚ

let supabaseClient = null;

// Cargar dinámicamente dependencias de Supabase, config.js y el tema visual global
(function() {
    // 0. Redefinir la paleta en la configuración de Tailwind
    if (!window.tailwind) window.tailwind = {};
    if (!window.tailwind.config) window.tailwind.config = {};
    if (!window.tailwind.config.theme) window.tailwind.config.theme = { extend: {} };
    if (!window.tailwind.config.theme.extend) window.tailwind.config.theme.extend = {};
    if (!window.tailwind.config.theme.extend.colors) window.tailwind.config.theme.extend.colors = {};
    
    // Mapear los colores del tema de ESCARLÚ
    window.tailwind.config.theme.extend.colors.primary = "#C59B27"; // Dorado Champán
    window.tailwind.config.theme.extend.colors.secondary = "#F8C8D4"; // Rosa Palo
    window.tailwind.config.theme.extend.colors.background = "#FAF5F6"; // Fondo crema
    window.tailwind.config.theme.extend.colors.surface = "#FFFFFF"; // Blanco
    window.tailwind.config.theme.extend.colors["primary-container"] = "#FFF0F3"; // Rosa claro
    window.tailwind.config.theme.extend.colors["surface-container"] = "#FFF0F3";

    // 1. Cargar Supabase CDN
    if (!window.supabase) {
        const scriptSupa = document.createElement('script');
        scriptSupa.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
        scriptSupa.async = false;
        document.head.appendChild(scriptSupa);
    }
    
    // 2. Cargar config.js
    const scriptConfig = document.createElement('script');
    scriptConfig.src = "config.js";
    scriptConfig.async = false;
    document.head.appendChild(scriptConfig);

    // 3. Inyectar Estilo Global del Nuevo Tema Visual
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        :root {
          --bg-main: #FAF5F6;             /* Fondo general cálido/crema suave */
          --primary-pink: #F8C8D4;        /* Rosa palo suave para contenedores y acentos */
          --primary-pink-light: #FFF0F3;  /* Rosa tenue para tarjetas y Sidebar */
          --dark-text: #1A1A1A;           /* Negro elegante para títulos y textos */
          --accent-gold: #C59B27;         /* Dorado champán de la garza para botones y estados */
          --white: #FFFFFF;               /* Blanco para contraste en tablas e inputs */
        }

        @keyframes fadeInPage {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        body, html, main, .bg-background {
          background-color: var(--bg-main) !important;
          color: var(--dark-text) !important;
          font-family: 'Source Sans 3', sans-serif !important;
          animation: fadeInPage 0.35s cubic-bezier(0.25, 1, 0.5, 1) forwards !important;
        }

        /* Sidebar (Menú Lateral) */
        aside, nav, .bg-surface-container, [class*="bg-surface-container"] {
          background-color: var(--primary-pink-light) !important;
        }
        aside.hidden.md\:flex, nav.hidden.md\:flex {
          padding-left: 12px !important;
          padding-right: 12px !important;
        }
        aside a, nav a {
          transition: all 0.2s ease-in-out !important;
        }
        aside a:hover, nav a:hover {
          background-color: var(--primary-pink) !important;
          color: var(--dark-text) !important;
        }
        /* Ítem activo del menú lateral */
        .bg-primary-container, 
        aside a[class*="bg-primary-container"], 
        nav a[class*="bg-primary-container"] {
          background-color: var(--primary-pink) !important;
          color: var(--dark-text) !important;
          border-left: 4px solid var(--accent-gold) !important;
          padding-left: 12px !important; /* Compensa los 4px de border-left para que los iconos no se desplacen a la derecha */
          font-weight: 700 !important;
          border-radius: 12px !important;
        }

        /* Botones de Acción principales */
        .bg-primary, 
        button[type="submit"], 
        #btn-open-ingreso, 
        #btn-add-item, 
        #btn-submit-consolidated, 
        .bg-primary-container-dim, 
        button.bg-primary,
        button.bg-primary-container,
        #btnExportarExcel,
        #btnExportarExcelTienda {
          background-color: var(--dark-text) !important;
          color: var(--white) !important;
          border: 1px solid var(--accent-gold) !important;
          font-family: 'Source Sans 3', sans-serif !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          letter-spacing: 0.3px !important;
          border-radius: 12px !important;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08) !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          padding: 8px 18px !important;
        }
        .bg-primary:hover, 
        button[type="submit"]:hover, 
        #btn-open-ingreso:hover, 
        #btn-add-item:hover, 
        #btn-submit-consolidated:hover,
        #btnExportarExcel:hover,
        #btnExportarExcelTienda:hover {
          background-color: var(--accent-gold) !important;
          color: var(--dark-text) !important;
          box-shadow: 0 6px 14px rgba(197, 155, 39, 0.25) !important;
          transform: translateY(-1px) !important;
        }
        /* Botón de exportar con un estilo secundario de lujo */
        #btnExportarExcel, #btnExportarExcelTienda {
          background-color: var(--white) !important;
          color: var(--dark-text) !important;
          border: 2px solid var(--primary-pink) !important;
          box-shadow: 0 2px 6px rgba(248, 200, 212, 0.2) !important;
        }
        #btnExportarExcel:hover, #btnExportarExcelTienda:hover {
          background-color: var(--primary-pink-light) !important;
          border-color: var(--accent-gold) !important;
          color: var(--dark-text) !important;
        }
        
        /* Ocultar barra de búsqueda global redundante */
        #global-search-input, 
        header .flex-1.max-w-md,
        [placeholder*="Buscar transacción"],
        [placeholder*="Buscar producto"] {
          display: none !important;
        }

        /* Tarjetas y Tablas */
        .glass-card, 
        .bento-card, 
        .bg-white, 
        [class*="bg-surface-container-lowest"], 
        .bg-surface-container-lowest {
          background-color: var(--white) !important;
          border: 1px solid rgba(248, 200, 212, 0.4) !important;
          box-shadow: 0 4px 15px rgba(248, 200, 212, 0.12) !important;
          border-radius: 20px !important;
        }

        /* Cabecera de tablas */
        thead tr, .bg-surface-container-low, [class*="bg-surface-container-low"] {
          background-color: var(--primary-pink-light) !important;
          color: var(--dark-text) !important;
        }
        th {
          color: var(--dark-text) !important;
          font-weight: 700 !important;
        }

        /* Inputs y Selects */
        input[type="text"], input[type="number"], input[type="password"], input[type="email"], input[type="date"], select, textarea {
          border: 2px solid var(--primary-pink) !important;
          border-radius: 12px !important;
          color: var(--dark-text) !important;
        }
        input:focus, select:focus, textarea:focus {
          border-color: var(--accent-gold) !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(197, 155, 39, 0.2) !important;
        }
        select option {
          background-color: var(--white) !important;
          color: var(--dark-text) !important;
        }
        select option:hover, select option:checked {
          background-color: var(--primary-pink) !important;
          color: var(--dark-text) !important;
        }

        /* Quitar bordes y fondos a los inputs del stepper de cantidad */
        #ingreso-cantidad, 
        #edit-cantidad, 
        #qty-input,
        input#ingreso-cantidad, 
        input#edit-cantidad, 
        input#qty-input {
          border: none !important;
          background-color: transparent !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }

        h1, h2, h3, h4, h5, h6, .text-primary, .text-on-surface {
          color: var(--dark-text) !important;
        }
        .text-xs, .text-sm, .text-on-surface-variant {
          color: #4C4C4C !important;
        }

        .border-outline-variant, .border-outline-variant/30, .border-surface-variant {
          border-color: rgba(248, 200, 212, 0.4) !important;
        }

        /* Redefinir variables y clases primarias/secundarias de Tailwind */
        .bg-primary {
          background-color: var(--dark-text) !important; /* Negro elegante */
          color: var(--white) !important;
        }
        .bg-primary-container {
          background-color: var(--primary-pink-light) !important; /* Rosa claro */
          color: var(--dark-text) !important;
        }
        .text-primary {
          color: var(--dark-text) !important;
        }
        .border-primary {
          border-color: var(--primary-pink) !important;
        }
        .bg-primary\/10 {
          background-color: var(--primary-pink-light) !important;
          color: var(--accent-gold) !important;
          border: 1px solid var(--primary-pink) !important;
        }

        /* Estilo Exclusivo de Distinción para la Tarjeta de Balance Neto */
        #kpi-utilidad {
          font-family: 'Libre Caslon Text', serif !important;
          font-size: 34px !important;
          font-weight: 700 !important;
          text-shadow: 0 1px 2px rgba(116, 84, 117, 0.08);
        }
        /* Contenedor padre de la tarjeta de Balance Neto */
        #kpi-utilidad.text-primary {
          color: var(--accent-gold) !important; /* Dorado si es positivo */
        }
        #kpi-utilidad.text-error {
          color: #D32F2F !important; /* Rojo elegante si es negativo */
        }
        #caja-balance-card {
          border: 2px solid var(--accent-gold) !important;
          background: linear-gradient(135deg, var(--white) 60%, var(--primary-pink-light) 100%) !important;
          box-shadow: 0 8px 25px rgba(197, 155, 39, 0.15) !important;
          position: relative;
          overflow: hidden;
        }
        #caja-balance-card::after {
          content: "account_balance";
          font-family: 'Material Symbols Outlined';
          position: absolute;
          right: 15px;
          bottom: 10px;
          font-size: 48px;
          color: var(--accent-gold);
          opacity: 0.15;
          pointer-events: none;
        }

        /* Sobrescribir gradientes y fondos de cabeceras */
        [class*="from-primary"], 
        [class*="via-primary"], 
        [class*="to-primary"],
        [class*="bg-gradient-to-br"],
        .text-primary-container-dim {
          background-image: linear-gradient(135deg, var(--primary-pink) 0%, var(--primary-pink-light) 100%) !important;
          background-color: transparent !important;
        }

        /* Forzar legibilidad en textos de cabecera de modales */
        [class*="bg-gradient-to-br"] h3, 
        [class*="bg-gradient-to-br"] h4,
        [class*="bg-gradient-to-br"] p, 
        [class*="bg-gradient-to-br"] span, 
        [class*="bg-gradient-to-br"] .material-symbols-outlined,
        [class*="bg-gradient-to-br"] div {
          color: var(--dark-text) !important;
        }

        /* Botones de Cancelar/Cerrar secundarios en modales */
        button[onclick*="close"], 
        button[id*="cancel"], 
        .btn-cancel,
        [onclick*="Close"],
        [onclick*="cancel"],
        button.border-outline-variant {
          background-color: var(--primary-pink-light) !important;
          color: var(--dark-text) !important;
          border: 2px solid var(--primary-pink) !important;
          border-radius: 12px !important;
          background-image: none !important;
        }
        button[onclick*="close"]:hover, 
        button[id*="cancel"]:hover, 
        .btn-cancel:hover,
        [onclick*="Close"]:hover,
        [onclick*="cancel"]:hover {
          background-color: var(--primary-pink) !important;
        }

        /* Botón de Confirmar / Guardar en el Modal (Acción Principal) */
        button[type="submit"], 
        form button[type="submit"], 
        button[onclick*="save"],
        button[onclick*="Save"],
        #btn-confirm-delete,
        #btn-confirm-tienda-delete,
        .bg-primary,
        #btn-open-ingreso {
          background-color: var(--dark-text) !important;
          color: var(--white) !important;
          border: 1px solid var(--accent-gold) !important;
          background-image: none !important;
        }
        button[type="submit"]:hover, 
        form button[type="submit"]:hover, 
        button[onclick*="save"]:hover,
        #btn-confirm-delete:hover,
        #btn-confirm-tienda-delete:hover {
          background-color: var(--accent-gold) !important;
          color: var(--dark-text) !important;
          background-image: none !important;
        }

        /* Botones de Eliminar (Rojo legible) */
        button.bg-error,
        #btn-confirm-delete,
        #btn-confirm-tienda-delete {
          background-color: #D32F2F !important;
          color: var(--white) !important;
          border: 1px solid #C62828 !important;
          background-image: none !important;
        }
        button.bg-error:hover,
        #btn-confirm-delete:hover,
        #btn-confirm-tienda-delete:hover {
          background-color: #B71C1C !important;
          color: var(--white) !important;
        }
        .text-error {
          color: #D32F2F !important;
          background-color: transparent !important;
        }
    `;
    document.head.appendChild(styleEl);

})();

function getSupabaseClient() {
    if (!supabaseClient && window.supabase && typeof SUPABASE_URL !== 'undefined') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        window.supabaseClient = supabaseClient;
    }
    return supabaseClient;
}

// Interceptar setItem para sincronizar LocalStorage -> Supabase
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    const client = getSupabaseClient();
    if (!client) return;

    if (key === 'escarlu_inventory') {
        syncInventoryToSupabase(JSON.parse(value));
    } else if (key === 'escarlu_tienda_stock') {
        syncTiendaStockToSupabase(JSON.parse(value));
    } else if (key === 'escarlu_sales') {
        syncSalesToSupabase(JSON.parse(value));
    } else if (key === 'escarlu_requests') {
        syncRequestsToSupabase(JSON.parse(value));
    } else if (key === 'escarlu_expenses') {
        syncExpensesToSupabase(JSON.parse(value));
    } else if (key === 'escarlu_warehouse_entries') {
        syncWarehouseEntriesToSupabase(JSON.parse(value));
    } else if (key === 'escarlu_movimientos') {
        syncStoreMovementsToSupabase(JSON.parse(value));
    }
};

async function syncTiendaStockToSupabase(tiendaStock) {
    const client = getSupabaseClient();
    if (!client) return;
    const records = [];
    for (const [storeId, models] of Object.entries(tiendaStock)) {
        for (const [modelId, sizes] of Object.entries(models)) {
            for (const [sizeName, qty] of Object.entries(sizes)) {
                const tallaId = TALLA_KEYS[sizeName];
                if (!tallaId) continue;
                // Para las tiendas, se guarda con un ID de color por defecto COL-01 (Negro)
                const colorId = "COL-01";
                const stockId = `STK-${storeId}-${modelId}-${colorId}-${tallaId}`;
                records.push({
                    id_stock: stockId,
                    id_sede: storeId,
                    id_modelo: modelId,
                    id_color: colorId,
                    id_talla: tallaId,
                    cantidad: qty,
                    ultima_actualizacion: new Date().toISOString()
                });
            }
        }
    }
    if (records.length > 0) {
        await client.from('stock').upsert(records);
    }
}

async function syncInventoryToSupabase(localInv) {
    const client = getSupabaseClient();
    if (!client) return;
    const records = [];
    for (const [storeId, models] of Object.entries(localInv)) {
        for (const [modelId, colors] of Object.entries(models)) {
            for (const [colorId, sizes] of Object.entries(colors)) {
                for (const [sizeName, qty] of Object.entries(sizes)) {
                    const tallaId = TALLA_KEYS[sizeName];
                    if (!tallaId) continue;
                    const stockId = `STK-${storeId}-${modelId}-${colorId}-${tallaId}`;
                    records.push({
                        id_stock: stockId,
                        id_sede: storeId,
                        id_modelo: modelId,
                        id_color: colorId,
                        id_talla: tallaId,
                        cantidad: qty,
                        ultima_actualizacion: new Date().toISOString()
                    });
                }
            }
        }
    }
    if (records.length > 0) {
        await client.from('stock').upsert(records);
    }
}

async function syncRequestsToSupabase(localReqs) {
    const client = getSupabaseClient();
    if (!client) return;
    
    // 1. Upsert current requests
    const records = [];
    for (const req of localReqs) {
        const tallaId = TALLA_KEYS[req.size] || 'TAL-03';
        records.push({
            id_solicitud: req.id,
            tipo: req.type === 'reposicion' ? 'reposición' : 'traspaso',
            id_sede_origen: req.origin === 'central' ? 'ALM-01' : req.origin,
            id_sede_destino: req.destination,
            id_modelo: req.model,
            id_color: req.color,
            id_talla: tallaId,
            cantidad: req.qty,
            estado: req.status,
            fecha_solicitud: req.date
        });
    }
    if (records.length > 0) {
        await client.from('solicitudes_traspaso').upsert(records);
    }

    // 2. Delete requests in Supabase that are no longer present locally for this store destination
    const user = getCurrentUser();
    const storeId = user ? user.storeId : null;
    if (storeId) {
        const { data: dbReqs } = await client.from('solicitudes_traspaso')
            .select('id_solicitud')
            .eq('id_sede_destino', storeId);
            
        if (dbReqs) {
            const localIds = localReqs.map(r => r.id);
            const idsToDelete = dbReqs
                .map(r => r.id_solicitud)
                .filter(id => !localIds.includes(id));
                
            if (idsToDelete.length > 0) {
                await client.from('solicitudes_traspaso')
                    .delete()
                    .in('id_solicitud', idsToDelete);
            }
        }
    }
}

async function syncSalesToSupabase(localSales) {
    const client = getSupabaseClient();
    if (!client) return;
    const user = getCurrentUser();
    const userId = user ? user.id_usuario : 'USR-03';
    
    const salesRecords = [];
    const detailRecords = [];

    for (const sale of localSales) {
        salesRecords.push({
            id_venta: sale.id,
            id_sede: sale.storeId,
            id_usuario: userId,
            fecha_hora: sale.date,
            monto_total: sale.amount,
            metodo_pago: sale.method,
            estado: sale.status,
            referencia: sale.reference || null
        });

        if (sale.items && sale.items.length > 0) {
            for (let i = 0; i < sale.items.length; i++) {
                const item = sale.items[i];
                const tallaId = TALLA_KEYS[item.size] || 'TAL-03';
                const subtotal = (item.price || 0) * (item.qty || 1);
                detailRecords.push({
                    id_detalle: `DV-${sale.id}-${i + 1}`,
                    id_venta: sale.id,
                    id_modelo: item.model,
                    id_color: item.color || 'COL-01',
                    id_talla: tallaId,
                    cantidad: item.qty,
                    precio_unitario: item.price || 0,
                    subtotal: subtotal
                });
            }
        }
    }

    if (salesRecords.length > 0) {
        await client.from('ventas').upsert(salesRecords);
    }
    if (detailRecords.length > 0) {
        await client.from('detalle_venta').upsert(detailRecords);
    }
}

async function syncExpensesToSupabase(localExpenses) {
    const client = getSupabaseClient();
    if (!client) return;

    // Mapa de IDs legáceos (formato viejo) a IDs reales de sede
    const LEGACY_STORE_MAP = {
        "tienda_1": "TDA-01",
        "tienda_2": "TDA-02",
        "tienda_3": "TDA-03",
        "tienda_4": "TDA-04",
        "general":  "CTR-01"
    };

    const records = [];
    for (const exp of localExpenses) {
        let sedeId = exp.storeId || "CTR-01";
        // Normalizar IDs legáceos
        if (LEGACY_STORE_MAP[sedeId]) sedeId = LEGACY_STORE_MAP[sedeId];
        // Si aún es un valor desconocido, usar CTR-01
        const validIds = ["CTR-01","ALM-01","TDA-01","TDA-02","TDA-03","TDA-04"];
        if (!validIds.includes(sedeId)) sedeId = "CTR-01";

        records.push({
            id_gasto: exp.id,
            descripcion: exp.description,
            categoria: exp.category === 'fabricacion' ? 'fabricación' : exp.category,
            monto: exp.amount,
            fecha: exp.date,
            id_sede: sedeId
        });
    }
    if (records.length > 0) {
        await client.from('gastos').upsert(records);
    }
}

async function syncWarehouseEntriesToSupabase(entries) {
    const client = getSupabaseClient();
    if (!client) return;
    const records = [];
    for (const ent of entries) {
        records.push({
            id: ent.id,
            fecha_hora: ent.date,
            origen_id: null,
            destino_id: 'ALM-01',
            modelo_id: ent.model,
            color_id: ent.color || 'COL-01',
            talla: ent.size,
            cantidad: ent.qty,
            tipo: 'ingreso',
            user_label: ent.user || 'Jefe de Almacén',
            editado: false,
            fecha_edicion: null,
            cantidad_original: ent.qty
        });
    }
    if (records.length > 0) {
        await client.from('movimientos_inventario').upsert(records);
    }
}

async function syncStoreMovementsToSupabase(movs) {
    const client = getSupabaseClient();
    if (!client) return;
    const records = [];
    for (const mov of movs) {
        records.push({
            id: mov.id,
            fecha_hora: mov.fecha_hora,
            origen_id: mov.origen_id,
            destino_id: mov.destino_id,
            modelo_id: mov.modelo_id,
            color_id: mov.color || 'COL-01',
            talla: mov.talla,
            cantidad: mov.cantidad,
            tipo: mov.tipo || 'salida_tienda',
            user_label: mov.user || 'Vendedora',
            editado: mov.editado || false,
            fecha_edicion: mov.fecha_edicion || null,
            cantidad_original: mov.cantidad_original || mov.cantidad
        });
    }
    if (records.length > 0) {
        await client.from('movimientos_inventario').upsert(records);
    }
}

function triggerStorageUpdate(key, value) {
    const event = new Event('storage');
    event.key = key;
    event.newValue = value;
    window.dispatchEvent(event);
}

async function downloadFromSupabase() {
    const client = getSupabaseClient();
    if (!client) return;

    // 0. Download Sedes (Stores)
    try {
        const { data: sedesData } = await client.from('sedes').select('*');
        if (sedesData) {
            const tempSedes = {};
            sedesData.forEach(s => {
                tempSedes[s.id_sede] = s.ubicacion;
            });
            originalSetItem.call(localStorage, 'escarlu_sedes', JSON.stringify(tempSedes));
            Object.assign(STORE_NAMES, tempSedes);
            triggerStorageUpdate('escarlu_sedes', JSON.stringify(tempSedes));
        }
    } catch (e) {
        console.error("Error downloading sedes from Supabase:", e);
    }

    // 1. Download Stock
    const { data: stockData } = await client.from('stock').select('*');
    if (stockData) {
        const inventory = {};
        const tiendaStock = {};

        stockData.forEach(row => {
            const storeId = row.id_sede;
            const modelId = row.id_modelo;
            const colorId = row.id_color;
            const sizeName = TALLA_NAMES[row.id_talla];
            if (!sizeName) return;

            // 1.1 Poblar estructura con colores (escarlu_inventory)
            if (!inventory[storeId]) inventory[storeId] = {};
            if (!inventory[storeId][modelId]) inventory[storeId][modelId] = {};
            if (!inventory[storeId][modelId][colorId]) inventory[storeId][modelId][colorId] = {};
            inventory[storeId][modelId][colorId][sizeName] = row.cantidad;

            // 1.2 Poblar estructura consolidada sin colores (escarlu_tienda_stock)
            if (!tiendaStock[storeId]) tiendaStock[storeId] = {};
            if (!tiendaStock[storeId][modelId]) tiendaStock[storeId][modelId] = {};
            
            // Si la sede es una tienda (TDA), sumamos la cantidad de todos los colores para esa talla
            if (storeId.startsWith("TDA-")) {
                tiendaStock[storeId][modelId][sizeName] = (tiendaStock[storeId][modelId][sizeName] || 0) + row.cantidad;
            } else {
                // Para almacén u otras sedes, también creamos la estructura base
                tiendaStock[storeId][modelId][sizeName] = (tiendaStock[storeId][modelId][sizeName] || 0) + row.cantidad;
            }
        });

        const invStr = JSON.stringify(inventory);
        originalSetItem.call(localStorage, 'escarlu_inventory', invStr);
        triggerStorageUpdate('escarlu_inventory', invStr);

        const tiendaInvStr = JSON.stringify(tiendaStock);
        originalSetItem.call(localStorage, 'escarlu_tienda_stock', tiendaInvStr);
        triggerStorageUpdate('escarlu_tienda_stock', tiendaInvStr);
    }

    // 2. Download Sales
    const { data: salesData } = await client.from('ventas').select('*');
    if (salesData) {
        const sales = salesData.map(row => ({
            id: row.id_venta,
            storeId: row.id_sede,
            amount: parseFloat(row.monto_total),
            method: row.metodo_pago,
            status: row.estado,
            reference: row.referencia || "",
            client: row.client || "Cliente General",
            date: row.fecha_hora
        }));
        const salesStr = JSON.stringify(sales);
        originalSetItem.call(localStorage, 'escarlu_sales', salesStr);
        triggerStorageUpdate('escarlu_sales', salesStr);
    }

    // 3. Download Requests
    const { data: reqsData } = await client.from('solicitudes_traspaso').select('*');
    if (reqsData) {
        const reqs = reqsData.map(row => ({
            id: row.id_solicitud,
            type: row.tipo === 'reposición' ? 'reposicion' : 'traspaso',
            origin: row.id_sede_origen,
            destination: row.id_sede_destino,
            model: row.id_modelo,
            color: row.id_color,
            size: TALLA_NAMES[row.id_talla] || 'M',
            qty: row.cantidad,
            status: row.estado,
            date: row.fecha_solicitud
        }));
        const reqsStr = JSON.stringify(reqs);
        originalSetItem.call(localStorage, 'escarlu_requests', reqsStr);
        triggerStorageUpdate('escarlu_requests', reqsStr);
    }

    // 4. Download Expenses
    const { data: expData } = await client.from('gastos').select('*');
    if (expData) {
        const expenses = expData.map(row => ({
            id: row.id_gasto,
            description: row.descripcion,
            category: row.categoria === 'fabricación' ? 'fabricacion' : row.categoria,
            amount: parseFloat(row.monto),
            date: row.fecha,
            // CTR-01 = gasto general (sin sede específica)
            storeId: (row.id_sede === 'CTR-01' || !row.id_sede) ? '' : row.id_sede
        }));
        const expStr = JSON.stringify(expenses);
        originalSetItem.call(localStorage, 'escarlu_expenses', expStr);
        triggerStorageUpdate('escarlu_expenses', expStr);
    }

    // 5. Download Models (public.modelos)
    try {
        const { data: modelsData } = await client.from('modelos').select('*');
        if (modelsData && modelsData.length > 0) {
            originalSetItem.call(localStorage, 'escarlu_modelos', JSON.stringify(modelsData));
            updateModelNamesFromLocalStorage();
            triggerStorageUpdate('escarlu_modelos', JSON.stringify(modelsData));
        }
    } catch (e) {
        console.error("Error downloading models from Supabase:", e);
    }

    // 6. Download Movimientos de Inventario (Entradas de almacén e historial de tiendas)
    try {
        const { data: movsData } = await client.from('movimientos_inventario').select('*');
        if (movsData) {
            const warehouseEntries = [];
            const storeMovements = [];

            movsData.forEach(row => {
                const mov = {
                    id: row.id,
                    fecha_hora: row.fecha_hora,
                    origen_id: row.origen_id,
                    destino_id: row.destino_id,
                    modelo_id: row.modelo_id,
                    color: row.color_id,
                    talla: row.talla,
                    cantidad: row.cantidad,
                    tipo: row.tipo,
                    editado: row.editado,
                    fecha_edicion: row.fecha_edicion,
                    cantidad_original: row.cantidad_original,
                    user: row.user_label
                };

                if (row.tipo === 'ingreso') {
                    warehouseEntries.push({
                        id: row.id,
                        type: 'ingreso',
                        model: row.modelo_id,
                        color: row.color_id,
                        size: row.talla,
                        qty: row.cantidad,
                        date: row.fecha_hora,
                        user: row.user_label || 'Jefe de Almacén'
                    });
                } else {
                    storeMovements.push(mov);
                }
            });

            const entriesStr = JSON.stringify(warehouseEntries);
            originalSetItem.call(localStorage, 'escarlu_warehouse_entries', entriesStr);
            triggerStorageUpdate('escarlu_warehouse_entries', entriesStr);

            const movsStr = JSON.stringify(storeMovements);
            originalSetItem.call(localStorage, 'escarlu_movimientos', movsStr);
            triggerStorageUpdate('escarlu_movimientos', movsStr);
        }
    } catch (e) {
        console.error("Error downloading inventory movements from Supabase:", e);
    }
}

const DEFAULT_INVENTORY = {
    // Almacén Central
    "ALM-01": {
        "MOD-001": {
            "COL-01": { "S": 40, "M": 45, "L": 35, "XL": 20 },
            "COL-02": { "S": 30, "M": 35, "L": 25, "XL": 0  },
            "COL-14": { "S": 20, "M": 25, "L": 0,  "XL": 0  }
        },
        "MOD-002": {
            "COL-01": { "S": 30, "M": 35, "L": 20, "XL": 0  },
            "COL-14": { "S": 20, "M": 25, "L": 0,  "XL": 0  }
        },
        "MOD-003": {
            "COL-09": { "S": 25, "M": 30, "L": 0,  "XL": 0  },
            "COL-18": { "S": 20, "M": 25, "L": 0,  "XL": 0  }
        },
        "MOD-005": {
            "COL-05": { "S": 20, "M": 25, "L": 15, "XL": 0  }
        }
    },
    // Tienda Santa Lucía
    "TDA-01": {
        "MOD-001": {
            "COL-01": { "S": 8,  "M": 10, "L": 6, "XL": 0 },
            "COL-02": { "S": 5,  "M": 8,  "L": 0, "XL": 0 },
            "COL-14": { "S": 4,  "M": 6,  "L": 0, "XL": 0 }
        },
        "MOD-002": {
            "COL-01": { "S": 0,  "M": 6,  "L": 0, "XL": 0 },
            "COL-14": { "S": 5,  "M": 7,  "L": 0, "XL": 0 }
        },
        "MOD-003": {
            "COL-09": { "S": 4,  "M": 6,  "L": 0, "XL": 0 },
            "COL-18": { "S": 4,  "M": 5,  "L": 0, "XL": 0 }
        }
    },
    // Tienda Generales Suplex
    "TDA-02": {
        "MOD-001": {
            "COL-01": { "S": 6, "M": 8, "L": 0, "XL": 0 },
            "COL-03": { "S": 5, "M": 7, "L": 0, "XL": 0 }
        },
        "MOD-002": {
            "COL-01": { "S": 0, "M": 5, "L": 4, "XL": 0 }
        },
        "MOD-003": {
            "COL-09": { "S": 0, "M": 5, "L": 0, "XL": 0 }
        }
    },
    // Tienda Generales Pasadizo
    "TDA-03": {
        "MOD-001": {
            "COL-01": { "S": 5, "M": 7, "L": 0, "XL": 0 },
            "COL-04": { "S": 4, "M": 6, "L": 0, "XL": 0 }
        },
        "MOD-002": {
            "COL-14": { "S": 4, "M": 5, "L": 0, "XL": 0 }
        }
    },
    // Tienda Aviación
    "TDA-04": {
        "MOD-001": {
            "COL-05": { "S": 6, "M": 8, "L": 5, "XL": 0 }
        },
        "MOD-002": {
            "COL-05": { "S": 4, "M": 6, "L": 0, "XL": 0 }
        },
        "MOD-005": {
            "COL-05": { "S": 0, "M": 4, "L": 0, "XL": 0 }
        }
    }
};

const DEFAULT_SALES = [
    { id: "TX-1001", storeId: "TDA-01", amount: 150.00, method: "efectivo", status: "aprobado", reference: "", client: "Carlos Fuentes", date: "2026-07-21T10:15:00" },
    { id: "TX-1002", storeId: "TDA-01", amount: 350.00, method: "yape", status: "pendiente", reference: "001-9482", client: "Maria Fernández", date: "2026-07-21T14:40:00" }
];

const DEFAULT_REQUESTS = [
    { id: "REQ-1001", type: "reposicion", origin: "ALM-01", destination: "TDA-01", model: "MOD-002", color: "COL-02", size: "M", qty: 5, status: "pendiente", date: "2026-07-21T09:30:00" }
];

const DEFAULT_EXPENSES = [
    { id: "EXP-1001", description: "Compra a Proveedor Hilandería S.A.", category: "proveedores", amount: 1200.00, date: "2026-07-20" }
];

const STORE_NAMES = {
    "ALM-01": "Almacén",
    "TDA-01": "Tienda Santa Lucía",
    "TDA-02": "Tienda Generales Suplex",
    "TDA-03": "Tienda Generales Pasadizo",
    "TDA-04": "Tienda Aviación",
    "CTR-01": "Administración"
};

// Sincronizar sedes dinámicas guardadas en localStorage
try {
    const savedSedes = localStorage.getItem("escarlu_sedes");
    if (savedSedes) {
        Object.assign(STORE_NAMES, JSON.parse(savedSedes));
    }
} catch (e) {
    console.error("Error parsing escarlu_sedes:", e);
}

const MODEL_NAMES = {
    "MOD-001": "Camisero MC",
    "MOD-002": "Camisero ML",
    "MOD-003": "Girasol MC",
    "MOD-004": "Girasol ML",
    "MOD-005": "Redondo MC",
    "MOD-006": "Redondo ML",
    "MOD-007": "Cuadrado MC",
    "MOD-008": "Cuadrado ML",
    "MOD-009": "Tania MC",
    "MOD-010": "Tania ML",
    "MOD-011": "Noemi MC",
    "MOD-012": "Noemi ML",
    "MOD-013": "Boton MC",
    "MOD-014": "Boton ML",
    "MOD-015": "Short Pinza",
    "MOD-016": "Short Boton",
    "MOD-017": "Chompa Redondo",
    "MOD-018": "Chompa V",
    "MOD-019": "Buzo Normal",
    "MOD-020": "Corazon MC",
    "MOD-021": "Corazon ML"
};

const COLOR_NAMES = {
    "COL-01": "Negro",
    "COL-02": "Perla",
    "COL-03": "Beige",
    "COL-04": "Botella",
    "COL-05": "Marron",
    "COL-06": "Acero",
    "COL-07": "Camello",
    "COL-08": "Rojo",
    "COL-09": "Fucsia",
    "COL-10": "Lacre",
    "COL-11": "Azul noche",
    "COL-12": "Amarillo",
    "COL-13": "Naranja",
    "COL-14": "Palo rosa",
    "COL-15": "Topo",
    "COL-16": "Italiano",
    "COL-17": "Celeste",
    "COL-18": "Lila",
    "COL-19": "Melange"
};

const TALLA_NAMES = {
    "TAL-01": "St",
    "TAL-02": "S",
    "TAL-03": "M",
    "TAL-04": "L",
    "TAL-05": "XL"
};

const TALLA_KEYS = {
    "St": "TAL-01",
    "S": "TAL-02",
    "M": "TAL-03",
    "L": "TAL-04",
    "XL": "TAL-05"
};

// Inicialización de datos en localStorage
function initDB() {
    if (!localStorage.getItem("escarlu_inventory")) {
        localStorage.setItem("escarlu_inventory", JSON.stringify(DEFAULT_INVENTORY));
    }
    if (!localStorage.getItem("escarlu_sales")) {
        localStorage.setItem("escarlu_sales", JSON.stringify(DEFAULT_SALES));
    }
    if (!localStorage.getItem("escarlu_requests")) {
        localStorage.setItem("escarlu_requests", JSON.stringify(DEFAULT_REQUESTS));
    }
    if (!localStorage.getItem("escarlu_expenses")) {
        localStorage.setItem("escarlu_expenses", JSON.stringify(DEFAULT_EXPENSES));
    }
}

// Iniciar sesión y seguridad de rutas
const USER_ROLES = {
    "admin@escarlu.com": { email: "admin@escarlu.com", role: "admin", label: "Administrador / Dueño", storeId: "CTR-01", id_usuario: "USR-01" },
    "almacen@escarlu.com": { email: "almacen@escarlu.com", role: "almacen", label: "Almacén Central", storeId: "ALM-01", id_usuario: "USR-02" },
    "tienda1@escarlu.com": { email: "tienda1@escarlu.com", role: "tienda", label: "Tienda Santa Lucía", storeId: "TDA-01", id_usuario: "USR-03" },
    "tienda2@escarlu.com": { email: "tienda2@escarlu.com", role: "tienda", label: "Tienda Generales Suplex", storeId: "TDA-02", id_usuario: "USR-04" },
    "tienda3@escarlu.com": { email: "tienda3@escarlu.com", role: "tienda", label: "Tienda Generales Pasadizo", storeId: "TDA-03", id_usuario: "USR-05" },
    "tienda4@escarlu.com": { email: "tienda4@escarlu.com", role: "tienda", label: "Tienda Aviación", storeId: "TDA-04", id_usuario: "USR-06" }
};

function getCurrentUser() {
    const userJson = sessionStorage.getItem("escarlu_current_user") || localStorage.getItem("escarlu_current_user");
    if (!userJson) return null;
    return JSON.parse(userJson);
}

function setCurrentUser(user) {
    if (user) {
        sessionStorage.setItem("escarlu_current_user", JSON.stringify(user));
        localStorage.setItem("escarlu_current_user", JSON.stringify(user));
    } else {
        sessionStorage.removeItem("escarlu_current_user");
        localStorage.removeItem("escarlu_current_user");
    }
}

function login(email, password) {
    initDB();
    const user = USER_ROLES[email.toLowerCase().trim()];
    if (user && password === getPasswordForEmail(email)) {
        setCurrentUser(user);
        return { success: true, user };
    }
    return { success: false, message: "Usuario o contraseña incorrectos." };
}

function getPasswordForEmail(email) {
    const formatted = email.toLowerCase().trim();
    if (formatted === "admin@escarlu.com") return "admin123";
    if (formatted === "almacen@escarlu.com") return "almacen123";
    if (formatted.startsWith("tienda")) return "tienda123";
    return "";
}

// Guardia de seguridad para las páginas
function checkAuth() {
    const user = getCurrentUser();
    const path = window.location.pathname.toLowerCase();
    
    // Si no está logueado y no está en index.html, redirige a login
    if (!user && !path.endsWith("index.html") && path !== "/") {
        window.location.href = "index.html";
        return;
    }
    
    if (user) {
        // Si está logueado e intenta ir a index.html, lo manda a su panel correspondiente
        if (path.endsWith("index.html") || path === "/") {
            redirectToDefaultPage(user);
            return;
        }

        // Restricciones de acceso por rol
        const ownerPages = ["cajadueno.html", "cortesdueno.html", "stockgeneraldueno.html"];
        const almacenPages = ["historialmacen.html", "ingresoprendalmacen.html", "solicitudpendientealmacen.html", "stockalmacen.html", "almacen.html"];
        const tiendaPages = ["cajatienda.html", "solitienda.html", "registrarventa.html", "stocktienda.html", "solicitud.html", "atenderpedidos.html", "historialprendas.html"];

        const currentPage = path.split("/").pop();

        if (ownerPages.includes(currentPage) && user.role !== "admin") {
            redirectToDefaultPage(user);
        } else if (almacenPages.includes(currentPage) && user.role !== "almacen" && user.role !== "admin") {
            redirectToDefaultPage(user);
        } else if (tiendaPages.includes(currentPage) && user.role !== "tienda" && user.role !== "admin") {
            redirectToDefaultPage(user);
        }
    }
}

function redirectToDefaultPage(user) {
    if (user.role === "admin") {
        window.location.href = "cajadueno.html";
    } else if (user.role === "almacen") {
        window.location.href = "historialmacen.html";
    } else {
        window.location.href = "cajatienda.html";
    }
}

// Barra de simulación desactivada por requerimiento del cliente
function injectSimulatorBar() {}

// Inyectar Navbar dinámico y Logo
function renderSideNav(activePage) {
    const user = getCurrentUser();
    if (!user) return;
    
    // Buscar elemento nav o aside existente
    let sidenav = document.querySelector("aside");
    if (!sidenav) sidenav = document.querySelector("nav");
    if (!sidenav) return;
    
    // Limpiar clases y estructurar
    sidenav.className = "hidden md:flex flex-col h-screen fixed left-0 top-0 py-4 px-stack-sm bg-surface-container shadow-md z-50 w-72 transition-all duration-300";
    
    // Logo en la esquina superior izquierda
    let brandHeaderHtml = `
        <div class="px-4 mb-4 flex flex-col items-center gap-2">
            <div class="w-16 h-16 flex items-center justify-center">
                <img src="logo_nuevo.jpeg" alt="Escarlú Logo" class="object-cover w-full h-full rounded-2xl" onerror="this.src='https://placehold.co/80x80?text=ESCARL%C3%9A'"/>
            </div>
            <div class="text-center">
                <h1 class="font-headline-md text-xl text-primary font-bold tracking-tight">ESCARLÚ</h1>
                <p class="font-body-sm text-[11px] text-on-surface-variant font-semibold mt-0.5">${user.label}</p>
            </div>
        </div>
    `;
    
    // Links según Rol especificado exactamente por el usuario
    const storeName = STORE_NAMES?.[user.storeId] || user.label || "Sede";
    let linksHtml = "";
    
    if (user.role === "admin") {
        // DUEÑO: cajadueno.html, stockgeneraldueno.html, tiendasdueno.html
        linksHtml += `
            <a class="flex items-center gap-4 px-4 py-3.5 rounded-xl min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'cajadueno' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="cajadueno.html">
                <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' ${activePage === 'cajadueno' ? 1 : 0};">account_balance_wallet</span>
                <span style="font-family: 'Source Sans 3', sans-serif; font-size: 16px; font-weight: 600;">Caja</span>
            </a>
            <a class="flex items-center gap-4 px-4 py-3.5 rounded-xl min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'stockgeneraldueno' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="stockgeneraldueno.html">
                <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' ${activePage === 'stockgeneraldueno' ? 1 : 0};">inventory_2</span>
                <span style="font-family: 'Source Sans 3', sans-serif; font-size: 16px; font-weight: 600;">Stock General</span>
            </a>
            <a class="flex items-center gap-4 px-4 py-3.5 rounded-xl min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'tiendasdueno' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="tiendasdueno.html">
                <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' ${activePage === 'tiendasdueno' ? 1 : 0};">store</span>
                <span style="font-family: 'Source Sans 3', sans-serif; font-size: 16px; font-weight: 600;">Gestionar Tiendas</span>
            </a>
        `;
    } else if (user.role === "almacen") {
        // ALMACÉN
        linksHtml += `
            <a class="flex items-center gap-4 px-4 py-3.5 rounded-xl min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'historialmacen' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="historialmacen.html">
                <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' ${activePage === 'historialmacen' ? 1 : 0};">history</span>
                <span style="font-family: 'Source Sans 3', sans-serif; font-size: 16px; font-weight: 600;">Historial Almacén</span>
            </a>
            <a class="flex items-center gap-4 px-4 py-3.5 rounded-xl min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'ingresoprendalmacen' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="ingresoprendalmacen.html">
                <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' ${activePage === 'ingresoprendalmacen' ? 1 : 0};">add_box</span>
                <span style="font-family: 'Source Sans 3', sans-serif; font-size: 16px; font-weight: 600;">Ingreso de Prendas</span>
            </a>
            <a class="flex items-center gap-4 px-4 py-3.5 rounded-xl min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'Stockalmacen' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="Stockalmacen.html">
                <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' ${activePage === 'Stockalmacen' ? 1 : 0};">inventory_2</span>
                <span style="font-family: 'Source Sans 3', sans-serif; font-size: 16px; font-weight: 600;">Stock Almacén</span>
            </a>
        `;
    } else {
        // TIENDA
        linksHtml += `
            <a class="flex items-center gap-4 px-4 py-3.5 rounded-xl min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'cajatienda' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="cajatienda.html">
                <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' ${activePage === 'cajatienda' ? 1 : 0};">storefront</span>
                <span style="font-family: 'Source Sans 3', sans-serif; font-size: 16px; font-weight: 600;">Caja</span>
            </a>
            <a class="flex items-center gap-4 px-4 py-3.5 rounded-xl min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'registrarventa' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="registrarventa.html">
                <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' ${activePage === 'registrarventa' ? 1 : 0};">point_of_sale</span>
                <span style="font-family: 'Source Sans 3', sans-serif; font-size: 16px; font-weight: 600;">Registrar Venta</span>
            </a>
            <a class="flex items-center gap-4 px-4 py-3.5 rounded-xl min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'stocktienda' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="stocktienda.html">
                <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' ${activePage === 'stocktienda' ? 1 : 0};">inventory</span>
                <span style="font-family: 'Source Sans 3', sans-serif; font-size: 16px; font-weight: 600;">Stock Tienda</span>
            </a>
            <a class="flex items-center gap-4 px-4 py-3.5 rounded-xl min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'historialprendas' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="historialprendas.html">
                <span class="material-symbols-outlined text-[24px]" style="font-variation-settings: 'FILL' ${activePage === 'historialprendas' ? 1 : 0};">history</span>
                <span style="font-family: 'Source Sans 3', sans-serif; font-size: 16px; font-weight: 600;">Historial Prendas</span>
            </a>
        `;
    }
    
    sidenav.innerHTML = `
        ${brandHeaderHtml}
        <div class="flex flex-col gap-2 flex-1 overflow-y-auto px-2">
            ${linksHtml}
        </div>
        <div class="mt-auto pt-2 border-t border-outline-variant px-2">
            <button id="logout-btn" class="w-full flex items-center gap-4 text-on-surface-variant py-2.5 px-4 hover:bg-error-container hover:text-on-error-container transition-all duration-200 rounded-xl min-h-[48px] text-left">
                <span class="material-symbols-outlined text-[24px]">logout</span>
                <span style="font-family: 'Source Sans 3', sans-serif; font-size: 16px; font-weight: 600;">Cerrar Sesión</span>
            </button>
        </div>
    `;
    
    document.getElementById("logout-btn").addEventListener("click", () => {
        setCurrentUser(null);
        window.location.href = "index.html";
    });
}

// Inyección móvil para barras superiores de hamburguesa
function setupMobileMenu(activePage) {
    const header = document.querySelector("main .md\\:hidden");
    if (!header) return;

    header.className = "md:hidden flex justify-between items-center w-full px-4 h-16 bg-surface-container border-b border-surface-variant mb-4 sticky top-0 z-40 shadow-sm";
    
    header.innerHTML = `
        <div class="flex items-center gap-3">
            <img src="logo_nuevo.jpeg" alt="Escarlú Logo" class="w-10 h-10 rounded-lg object-cover" onerror="this.src='https://placehold.co/50x50?text=ES'"/>
            <span class="font-headline-md text-headline-md text-primary font-bold">ESCARLÚ</span>
        </div>
        <button id="mobile-menu-trigger" class="w-10 h-10 flex items-center justify-center text-primary rounded-full hover:bg-surface-container-high transition-colors">
            <span class="material-symbols-outlined text-[28px]">menu</span>
        </button>
    `;

    let drawer = document.getElementById("mobile-menu-drawer");
    if (!drawer) {
        drawer = document.createElement("div");
        drawer.id = "mobile-menu-drawer";
        drawer.className = "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 opacity-0 pointer-events-none";
        drawer.innerHTML = `
            <div class="w-64 bg-surface-container h-full flex flex-col py-6 shadow-xl transition-transform duration-300 -translate-x-full">
                <!-- Se inyecta la navegación aquí -->
            </div>
        `;
        document.body.appendChild(drawer);

        drawer.addEventListener("click", (e) => {
            if (e.target === drawer) toggleDrawer(false);
        });
    }

    const drawerContent = drawer.querySelector("div");
    const user = getCurrentUser();
    let linksHtml = "";
    
    if (user.role === "admin") {
        linksHtml += `
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] transition-colors ${activePage === 'cajadueno' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}" href="cajadueno.html">
                <span class="material-symbols-outlined">account_balance_wallet</span>
                <span class="font-label-lg">Caja</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] transition-colors ${activePage === 'stockgeneraldueno' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}" href="stockgeneraldueno.html">
                <span class="material-symbols-outlined">inventory_2</span>
                <span class="font-label-lg">Stock General</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] transition-colors ${activePage === 'tiendasdueno' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}" href="tiendasdueno.html">
                <span class="material-symbols-outlined">store</span>
                <span class="font-label-lg">Gestionar Tiendas</span>
            </a>
        `;
    } else if (user.role === "almacen") {
        linksHtml += `
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] transition-colors ${activePage === 'historialmacen' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}" href="historialmacen.html">
                <span class="material-symbols-outlined">history</span>
                <span class="font-label-lg">Historial Almacén</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] transition-colors ${activePage === 'ingresoprendalmacen' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}" href="ingresoprendalmacen.html">
                <span class="material-symbols-outlined">add_box</span>
                <span class="font-label-lg">Ingreso de Prendas</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] transition-colors ${activePage === 'Stockalmacen' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}" href="Stockalmacen.html">
                <span class="material-symbols-outlined">inventory_2</span>
                <span class="font-label-lg">Stock Almacén</span>
            </a>
        `;
    } else {
        linksHtml += `
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] transition-colors ${activePage === 'cajatienda' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}" href="cajatienda.html">
                <span class="material-symbols-outlined">storefront</span>
                <span class="font-label-lg">Caja</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] transition-colors ${activePage === 'registrarventa' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}" href="registrarventa.html">
                <span class="material-symbols-outlined">point_of_sale</span>
                <span class="font-label-lg">Registrar Venta</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] transition-colors ${activePage === 'stocktienda' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}" href="stocktienda.html">
                <span class="material-symbols-outlined">inventory</span>
                <span class="font-label-lg">Stock Tienda</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] transition-colors ${activePage === 'historialprendas' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}" href="historialprendas.html">
                <span class="material-symbols-outlined">history</span>
                <span class="font-label-lg">Historial Prendas</span>
            </a>
        `;
    }

    drawerContent.className = "w-64 bg-surface-container h-full flex flex-col py-6 shadow-xl transition-transform duration-300 -translate-x-full";
    drawerContent.innerHTML = `
        <div class="px-6 mb-6 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <img src="logo_nuevo.jpeg" alt="Escarlú" class="w-8 h-8 rounded-lg object-cover"/>
                <span class="font-headline-md text-headline-md text-primary font-bold">ESCARLÚ</span>
            </div>
            <button id="close-drawer" class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-full">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
        <div class="flex flex-col gap-2 px-3 overflow-y-auto flex-1">
            ${linksHtml}
        </div>
        <div class="mt-auto px-4 pt-2 border-t border-outline-variant">
            <button id="mobile-logout-btn" class="w-full flex items-center gap-4 text-on-surface-variant py-2.5 px-4 hover:bg-error-container hover:text-on-error-container transition-colors rounded-lg min-h-[48px] text-left">
                <span class="material-symbols-outlined">logout</span>
                <span class="font-label-lg font-semibold">Cerrar Sesión</span>
            </button>
        </div>
    `;

    document.getElementById("mobile-menu-trigger").addEventListener("click", () => toggleDrawer(true));
    document.getElementById("close-drawer").addEventListener("click", () => toggleDrawer(false));
    document.getElementById("mobile-logout-btn").addEventListener("click", () => {
        setCurrentUser(null);
        window.location.href = "index.html";
    });

    function toggleDrawer(open) {
        if (open) {
            drawer.classList.remove("pointer-events-none", "opacity-0");
            drawer.classList.add("opacity-100");
            drawerContent.classList.remove("-translate-x-full");
        } else {
            drawer.classList.add("pointer-events-none", "opacity-0");
            drawer.classList.remove("opacity-100");
            drawerContent.classList.add("-translate-x-full");
        }
    }
}

let realtimeChannel = null;
let downloadTimeout = null;

function initRealtimeSubscription() {
    const client = getSupabaseClient();
    if (!client) return;

    // Evitar duplicar suscripciones
    if (realtimeChannel) return;

    // Debounce de descargas para no saturar la red con múltiples eventos simultáneos
    const triggerDebouncedDownload = () => {
        if (downloadTimeout) clearTimeout(downloadTimeout);
        downloadTimeout = setTimeout(() => {
            console.log("Realtime: Cambios detectados. Descargando datos actualizados...");
            downloadFromSupabase();
        }, 300);
    };

    realtimeChannel = client
        .channel('public-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'stock' }, (payload) => {
            console.log("Realtime: Cambio en tabla stock recibido", payload);
            triggerDebouncedDownload();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes_traspaso' }, (payload) => {
            console.log("Realtime: Cambio en solicitudes_traspaso recibido", payload);
            triggerDebouncedDownload();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'movimientos_inventario' }, (payload) => {
            console.log("Realtime: Cambio en movimientos_inventario recibido", payload);
            triggerDebouncedDownload();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ventas' }, (payload) => {
            console.log("Realtime: Cambio en ventas recibido", payload);
            triggerDebouncedDownload();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gastos' }, (payload) => {
            console.log("Realtime: Cambio en gastos recibido", payload);
            triggerDebouncedDownload();
        })
        .subscribe((status) => {
            console.log("Realtime: Estado de suscripción:", status);
        });
}

// Inicialización de cada página
document.addEventListener("DOMContentLoaded", () => {
    initDB();
    checkAuth();
    
    // Descarga inicial de Supabase con reintentos para asegurar carga del script
    downloadFromSupabase();
    setTimeout(downloadFromSupabase, 500);
    setTimeout(() => {
        downloadFromSupabase();
        initRealtimeSubscription();
    }, 1500);

    const path = window.location.pathname.toLowerCase();
    let pageName = "";
    if (path.includes("cajadueno.html")) pageName = "cajadueno";
    else if (path.includes("cortesdueno.html")) pageName = "cortesdueno";
    else if (path.includes("stockgeneraldueno.html")) pageName = "stockgeneraldueno";
    else if (path.includes("cajatienda.html")) pageName = "cajatienda";
    else if (path.includes("solitienda.html")) pageName = "solitienda";
    else if (path.includes("atenderpedidos.html")) pageName = "atenderpedidos";
    else if (path.includes("registrarventa")) pageName = "registrarventa";
    else if (path.includes("stocktienda.html")) pageName = "stocktienda";
    else if (path.includes("historialmacen.html")) pageName = "historialmacen";
    else if (path.includes("ingresoprendalmacen.html")) pageName = "ingresoprendalmacen";
    else if (path.includes("solicitudpendientealmacen.html")) pageName = "solicitudpendientealmacen";
    else if (path.includes("stockalmacen.html")) pageName = "Stockalmacen";
    else if (path.includes("almacen.html")) pageName = "Stockalmacen";
    else if (path.includes("solicitud.html")) pageName = "solitienda";
    
    if (pageName) {
        injectSimulatorBar();
        renderSideNav(pageName);
        setupMobileMenu(pageName);
        setupHeaderProfile();
        setupNotifications();
    }

    // Intervalo de seguridad: Recargar datos desde Supabase cada 30 segundos
    setInterval(() => {
        const user = getCurrentUser();
        if (user) {
            downloadFromSupabase();
        }
    }, 30000);
});

function setupHeaderProfile() {
    const user = getCurrentUser();
    if (!user) return;

    const storeLabel = STORE_NAMES[user.storeId] || user.storeId;

    // 1. Dynamic replacement of left-side store/sede badge
    const headerBadges = document.querySelectorAll('header span');
    headerBadges.forEach(span => {
        const text = span.textContent.trim();
        if (text === 'Tienda Santa Lucía' || text === 'Tienda Principal' || text === 'Almacén Central') {
            span.textContent = storeLabel;
        }
    });

    // 2. Replace user name/label on right-side of the header
    const profileTexts = document.querySelectorAll('header span, header p');
    profileTexts.forEach(el => {
        const text = el.textContent.trim();
        if (text === 'Admin_Escarlu' || text === 'Administrador' || text === 'Vendedora - Santa Lucía' || text === 'Vendedora - Santa Lucia' || text.startsWith('Vendedora -')) {
            el.textContent = user.label;
        }
    });

    // 3. Elevar el z-index de la cabecera (header) para evitar solapamientos con selects
    const headerEl = document.querySelector("header");
    if (headerEl) {
        headerEl.style.setProperty("z-index", "9990", "important");
    }

    // 4. Configurar Menú Desplegable (Dropdown) de Perfil
    const avatarImg = document.querySelector("header img");
    const profileContainer = avatarImg ? avatarImg.closest(".flex") : null;
    if (profileContainer && !profileContainer.id) {
        profileContainer.id = "header-profile-trigger";
        profileContainer.classList.add("cursor-pointer", "hover:opacity-90", "transition-all", "relative");

        // Crear Dropdown HTML si no existe
        let dropdown = document.getElementById("profile-dropdown");
        if (!dropdown) {
            dropdown = document.createElement("div");
            dropdown.id = "profile-dropdown";
            dropdown.className = "absolute right-0 top-full mt-2 w-48 border border-outline-variant rounded-xl shadow-lg py-2 hidden text-xs font-semibold text-left";
            dropdown.setAttribute("style", "background-color: #ffffff !important; z-index: 99999 !important;");
            dropdown.innerHTML = `
                <div id="dropdown-my-profile" class="flex items-center gap-2 px-4 py-2 text-on-surface hover:bg-gray-100 transition-colors cursor-pointer select-none">
                    <span class="material-symbols-outlined text-sm">person</span>
                    <span>Mi Perfil</span>
                </div>
                <div id="dropdown-logout" class="flex items-center gap-2 px-4 py-2 text-error hover:bg-red-100 transition-colors border-t border-outline-variant/50 cursor-pointer select-none">
                    <span class="material-symbols-outlined text-sm text-error">logout</span>
                    <span>Cerrar Sesión</span>
                </div>
            `;
            profileContainer.appendChild(dropdown);

            // Toggle Dropdown al hacer click en el Perfil
            profileContainer.addEventListener("click", (e) => {
                e.stopPropagation();
                dropdown.classList.toggle("hidden");
            });

            // Cerrar Dropdown al hacer click fuera
            document.addEventListener("click", () => {
                dropdown.classList.add("hidden");
            });

            // Enlazar Acciones
            document.getElementById("dropdown-my-profile").addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.add("hidden");
                openGlobalProfileModal();
            });

            document.getElementById("dropdown-logout").addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentUser(null);
                window.location.href = "index.html";
            });
        }
    }

    // Inyectar el Modal Global de Mi Cuenta si no existe
    injectGlobalProfileModal();
}

function injectGlobalProfileModal() {
    if (document.getElementById("global-profile-modal")) return;

    const modalHtml = `
    <div id="global-profile-modal" class="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] hidden items-center justify-center p-6 text-on-background">
        <div class="bg-white rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-outline-variant animate-in fade-in zoom-in-95 duration-200">
            <header class="bg-gradient-to-br from-[#F8C8D4] to-[#f0b3c0] p-6 border-b border-outline-variant text-on-surface flex justify-between items-center shrink-0">
                <div>
                    <h3 class="text-lg font-bold text-on-surface">Mi Cuenta</h3>
                    <p class="text-[11px] text-on-surface-variant font-medium">Configura tus datos de perfil y contraseña.</p>
                </div>
                <span id="close-global-profile-btn" class="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors cursor-pointer select-none">
                    <span class="material-symbols-outlined text-sm">close</span>
                </span>
            </header>
            
            <form id="global-profile-form" class="p-6 space-y-4 overflow-y-auto flex-1 min-h-0 text-left">
                <div class="flex flex-col gap-1">
                    <label class="text-[11px] font-bold text-on-surface-variant uppercase">Nombre Completo</label>
                    <input type="text" id="gprof-fullname" required class="border border-outline-variant rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-white text-on-background" />
                </div>
                
                <div class="flex flex-col gap-1">
                    <label class="text-[11px] font-bold text-on-surface-variant uppercase">Correo Electrónico (Solo Lectura)</label>
                    <input type="email" id="gprof-email" readonly class="border border-outline-variant rounded-xl px-3 py-2 text-sm bg-gray-50 text-gray-500 font-bold outline-none cursor-not-allowed" />
                </div>
                
                <hr class="border-outline-variant/50 my-2">
                
                <div class="space-y-4">
                    <h4 class="text-xs font-bold text-[#745475] uppercase">Cambiar Contraseña</h4>
                    
                    <div class="flex flex-col gap-1 relative">
                        <label class="text-[11px] font-bold text-on-surface-variant uppercase" for="gprof-old-password">Contraseña Actual</label>
                        <div class="relative flex items-center">
                            <input type="password" id="gprof-old-password" placeholder="Contraseña actual para validar" class="w-full border border-outline-variant rounded-xl pl-3 pr-10 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-white text-on-background" />
                            <span id="toggle-gprof-old-btn" class="absolute right-3 text-on-surface-variant hover:text-primary cursor-pointer flex items-center justify-center select-none" style="z-index: 10;">
                                <span class="material-symbols-outlined text-lg" id="gprof-old-icon">visibility</span>
                            </span>
                        </div>
                    </div>

                    <div class="flex flex-col gap-1 relative">
                        <label class="text-[11px] font-bold text-on-surface-variant uppercase" for="gprof-new-password">Nueva Contraseña</label>
                        <div class="relative flex items-center">
                            <input type="password" id="gprof-new-password" placeholder="Mínimo 8 caracteres" class="w-full border border-outline-variant rounded-xl pl-3 pr-10 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-white text-on-background" />
                            <span id="toggle-gprof-new-btn" class="absolute right-3 text-on-surface-variant hover:text-primary cursor-pointer flex items-center justify-center select-none" style="z-index: 10;">
                                <span class="material-symbols-outlined text-lg" id="gprof-new-icon">visibility</span>
                            </span>
                        </div>
                        <!-- Requisitos de Contraseña -->
                        <div class="mt-2 space-y-1 text-xs">
                            <div class="flex items-center gap-2 text-on-surface-variant font-semibold">
                                <span id="gprof-req-len-dot" class="w-2 h-2 rounded-full bg-gray-300 transition-colors duration-200"></span>
                                <span>Mínimo 8 caracteres</span>
                            </div>
                            <div class="flex items-center gap-2 text-on-surface-variant font-semibold">
                                <span id="gprof-req-upper-dot" class="w-2 h-2 rounded-full bg-gray-300 transition-colors duration-200"></span>
                                <span>Una letra mayúscula</span>
                            </div>
                            <div class="flex items-center gap-2 text-on-surface-variant font-semibold">
                                <span id="gprof-req-num-dot" class="w-2 h-2 rounded-full bg-gray-300 transition-colors duration-200"></span>
                                <span>Un número</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col gap-1 relative">
                        <label class="text-[11px] font-bold text-on-surface-variant uppercase" for="gprof-confirm-password">Confirmar Nueva Contraseña</label>
                        <div class="relative flex items-center">
                            <input type="password" id="gprof-confirm-password" placeholder="Confirmar nueva contraseña" class="w-full border border-outline-variant rounded-xl pl-3 pr-10 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-white text-on-background" />
                            <span id="toggle-gprof-confirm-btn" class="absolute right-3 text-on-surface-variant hover:text-primary cursor-pointer flex items-center justify-center select-none" style="z-index: 10;">
                                <span class="material-symbols-outlined text-lg" id="gprof-confirm-icon">visibility</span>
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-end gap-3 pt-4 border-t border-outline-variant/50">
                    <button type="button" id="cancel-gprof-btn" class="px-4 py-2 border border-outline-variant rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" class="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold shadow-md hover:bg-primary/95 transition-colors">
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    </div>
    `;

    const div = document.createElement("div");
    div.innerHTML = modalHtml;
    document.body.appendChild(div.firstElementChild);

    // Enlazar Eventos del modal
    document.getElementById("close-global-profile-btn").addEventListener("click", closeGlobalProfileModal);
    document.getElementById("cancel-gprof-btn").addEventListener("click", closeGlobalProfileModal);

    // Toggles de contraseña
    setupGprofPasswordToggle("gprof-old-password", "toggle-gprof-old-btn", "gprof-old-icon");
    setupGprofPasswordToggle("gprof-new-password", "toggle-gprof-new-btn", "gprof-new-icon");
    setupGprofPasswordToggle("gprof-confirm-password", "toggle-gprof-confirm-btn", "gprof-confirm-icon");

    // Validador de contraseña en tiempo real
    const newPassInput = document.getElementById("gprof-new-password");
    newPassInput.addEventListener("input", () => {
        const val = newPassInput.value;
        updateGprofDot("gprof-req-len-dot", val.length >= 8);
        updateGprofDot("gprof-req-upper-dot", /[A-Z]/.test(val));
        updateGprofDot("gprof-req-num-dot", /[0-9]/.test(val));
    });

    // Formulario Submit
    document.getElementById("global-profile-form").addEventListener("submit", handleGlobalProfileSubmit);
}

function setupGprofPasswordToggle(inputId, buttonId, iconId) {
    const passInput = document.getElementById(inputId);
    const toggleBtn = document.getElementById(buttonId);
    const eyeIcon = document.getElementById(iconId);
    if (toggleBtn && passInput && eyeIcon) {
        toggleBtn.addEventListener("click", () => {
            if (passInput.type === "password") {
                passInput.type = "text";
                eyeIcon.textContent = "visibility_off";
            } else {
                passInput.type = "password";
                eyeIcon.textContent = "visibility";
            }
        });
    }
}

function updateGprofDot(dotId, condition) {
    const dot = document.getElementById(dotId);
    if (dot) {
        if (condition) {
            dot.classList.remove("bg-gray-300");
            dot.classList.add("bg-green-500");
        } else {
            dot.classList.remove("bg-green-500");
            dot.classList.add("bg-gray-300");
        }
    }
}

function openGlobalProfileModal() {
    const user = getCurrentUser();
    if (!user) return;

    document.getElementById("gprof-fullname").value = user.label || "";
    document.getElementById("gprof-email").value = user.email || "";

    // Reset password fields
    document.getElementById("gprof-old-password").value = "";
    document.getElementById("gprof-new-password").value = "";
    document.getElementById("gprof-confirm-password").value = "";

    updateGprofDot("gprof-req-len-dot", false);
    updateGprofDot("gprof-req-upper-dot", false);
    updateGprofDot("gprof-req-num-dot", false);

    const modal = document.getElementById("global-profile-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeGlobalProfileModal() {
    const modal = document.getElementById("global-profile-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.getElementById("global-profile-form").reset();
}

async function handleGlobalProfileSubmit(e) {
    e.preventDefault();
    const client = getSupabaseClient();
    if (!client) {
        alert("Error: Supabase no inicializado.");
        return;
    }

    const user = getCurrentUser();
    if (!user) return;

    const newName = document.getElementById("gprof-fullname").value.trim();
    const oldPassword = document.getElementById("gprof-old-password").value.trim();
    const newPassword = document.getElementById("gprof-new-password").value.trim();
    const confirmPassword = document.getElementById("gprof-confirm-password").value.trim();

    let wantsPasswordChange = newPassword.length > 0;

    try {
        // Consultar el usuario en la tabla "usuarios" de Supabase para validar clave actual
        const { data: dbUsers, error: errFetch } = await client
            .from("usuarios")
            .select("*")
            .eq("id_usuario", user.id_usuario);

        if (errFetch) throw errFetch;
        if (!dbUsers || dbUsers.length === 0) {
            alert("Error: Usuario no encontrado en la base de datos.");
            return;
        }

        const dbUser = dbUsers[0];

        // Si desea cambiar la contraseña
        if (wantsPasswordChange) {
            if (!oldPassword) {
                alert("Debe ingresar su contraseña actual para confirmar el cambio.");
                return;
            }
            if (dbUser.contrasena !== oldPassword) {
                alert("La contraseña actual es incorrecta.");
                return;
            }
            if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
                alert("La nueva contraseña no cumple con los requisitos mínimos.");
                return;
            }
            if (newPassword !== confirmPassword) {
                alert("La confirmación de la contraseña no coincide.");
                return;
            }
        }

        // Ejecutar la actualización en Supabase
        const updateData = { nombre_completo: newName };
        if (wantsPasswordChange) {
            updateData.contrasena = newPassword;
        }

        const { error: errUpdate } = await client
            .from("usuarios")
            .update(updateData)
            .eq("id_usuario", user.id_usuario);

        if (errUpdate) throw errUpdate;

        // Actualizar datos de sesión local
        user.label = newName;
        setCurrentUser(user);

        alert("Datos actualizados correctamente.");
        closeGlobalProfileModal();

        // Actualizar el header inmediatamente en caliente
        setupHeaderProfile();

    } catch (err) {
        console.error("Error al actualizar perfil:", err);
        alert("Error al actualizar los datos: " + err.message);
    }
}

// Dynamic Notification System
function setupNotifications() {
    const user = getCurrentUser();
    if (!user) return;

    // 1. Find or create the bell button
    let bellBtn = document.getElementById('notification-bell-btn');
    if (!bellBtn) {
        // Try finding standard notification button by icon text
        const materialIcons = document.querySelectorAll('.material-symbols-outlined');
        for (const icon of materialIcons) {
            if (icon.textContent.trim() === 'notifications') {
                bellBtn = icon.closest('button') || icon.closest('.cursor-pointer');
                if (bellBtn) {
                    bellBtn.id = 'notification-bell-btn';
                    bellBtn.classList.add('relative');
                    // Remove static red dots
                    const staticDots = bellBtn.querySelectorAll('.bg-error, .bg-red-600, span.absolute');
                    staticDots.forEach(dot => {
                        if (!dot.classList.contains('bell-badge')) {
                            dot.remove();
                        }
                    });
                    break;
                }
            }
        }
    }

    if (!bellBtn) {
        // If still not found, search for the user profile container
        const headers = document.querySelectorAll('header');
        headers.forEach(header => {
            const profileContainer = header.querySelector('.flex.items-center.gap-4');
            if (profileContainer) {
                bellBtn = document.createElement('button');
                bellBtn.id = 'notification-bell-btn';
                bellBtn.className = 'relative text-primary hover:bg-surface-container transition-colors duration-200 rounded-full p-2 flex items-center justify-center min-h-[36px] min-w-[36px]';
                bellBtn.innerHTML = '<span class="material-symbols-outlined text-xl">notifications</span>';
                
                profileContainer.insertBefore(bellBtn, profileContainer.firstChild);
            }
        });
    }

    if (!bellBtn) return;

    const parent = bellBtn.parentElement;
    if (parent) {
        parent.classList.add('relative');
    }

    // 2. Load notifications and render badge
    function updateNotifications() {
        const sales = JSON.parse(localStorage.getItem("escarlu_sales")) || [];
        const reqs = JSON.parse(localStorage.getItem("escarlu_requests")) || [];
        
        let list = [];

        if (user.role === 'admin') {
            // Pending Yapes
            const pendingSales = sales.filter(s => s.status === 'pendiente');
            pendingSales.forEach(s => {
                const storeName = STORE_NAMES[s.storeId] || s.storeId;
                list.push({
                    text: `Yape por confirmar: S/ ${parseFloat(s.amount).toFixed(2)} de ${storeName}`,
                    url: 'cajadueno.html',
                    icon: 'payments',
                    date: s.date
                });
            });

            // Pending Transfer Requests
            const pendingReqs = reqs.filter(r => r.status === 'pendiente');
            pendingReqs.forEach(r => {
                const destName = STORE_NAMES[r.destination] || r.destination;
                list.push({
                    text: `Pedido pendiente: ${destName} pide ${r.qty} uds de ${MODEL_NAMES[r.model] || r.model}`,
                    url: 'stockgeneraldueno.html',
                    icon: 'swap_horiz',
                    date: r.date
                });
            });
        } else if (user.role === 'almacen') {
            // Pending requests directed to Almacén Central
            const pendingReqs = reqs.filter(r => r.status === 'pendiente' && r.origin === 'ALM-01');
            pendingReqs.forEach(r => {
                const destName = STORE_NAMES[r.destination] || r.destination;
                list.push({
                    text: `${destName} solicita ${r.qty} uds de ${MODEL_NAMES[r.model] || r.model}`,
                    url: 'ingresoprendalmacen.html',
                    icon: 'warehouse',
                    date: r.date
                });
            });
        } else if (user.role === 'tienda') {
            // Pending incoming transfer requests from other stores
            const pendingReqs = reqs.filter(r => r.status === 'pendiente' && r.origin === user.storeId);
            pendingReqs.forEach(r => {
                const destName = STORE_NAMES[r.destination] || r.destination;
                list.push({
                    text: `Traspaso: ${destName} te pide ${r.qty} uds de ${MODEL_NAMES[r.model] || r.model}`,
                    url: 'atenderpedidos.html',
                    icon: 'swap_horiz',
                    date: r.date
                });
            });

            // Approved requests sent by this store
            const approvedReqs = reqs.filter(r => r.status === 'aprobado' && r.destination === user.storeId);
            approvedReqs.forEach(r => {
                const origName = STORE_NAMES[r.origin] || r.origin;
                list.push({
                    text: `Aprobado: ${origName} despachó tu pedido de ${r.qty} uds`,
                    url: 'stocktienda.html',
                    icon: 'done_all',
                    date: r.date
                });
            });
        }

        // Render badge only if there are NEW notifications
        const lastReadStr = localStorage.getItem("escarlu_notifications_last_read") || new Date(0).toISOString();
        const lastRead = new Date(lastReadStr);

        const hasNew = list.some(item => {
            if (!item.date) return false;
            return new Date(item.date) > lastRead;
        });

        let badge = bellBtn.querySelector('.bell-badge');
        if (hasNew) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'bell-badge absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-white';
                bellBtn.appendChild(badge);
            }
        } else {
            if (badge) badge.remove();
        }

        // Store notification list on button for rendering on click
        bellBtn.dataset.notifications = JSON.stringify(list);
    }

    // Toggle popover dropdown card
    bellBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        let popover = document.getElementById('notification-popover');
        if (popover) {
            popover.remove();
            return;
        }

        // Mark as read: update last read time and re-render badge
        localStorage.setItem("escarlu_notifications_last_read", new Date().toISOString());
        updateNotifications();

        const list = JSON.parse(bellBtn.dataset.notifications || "[]");

        popover = document.createElement('div');
        popover.id = 'notification-popover';
        popover.className = 'absolute right-0 mt-2 w-80 bg-white border border-outline-variant/60 rounded-2xl shadow-2xl z-[100] p-4 flex flex-col gap-3 transition-all duration-200 transform scale-100 top-12';
        
        let itemsHtml = "";
        if (list.length === 0) {
            itemsHtml = `
                <div class="text-center py-6 text-on-surface-variant font-medium text-xs">
                    No tienes notificaciones pendientes.
                </div>
            `;
        } else {
            list.forEach(item => {
                itemsHtml += `
                    <a href="${item.url}" class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-container transition-colors border border-outline-variant/20">
                        <div class="w-8 h-8 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-base">${item.icon}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs text-on-surface font-medium leading-tight">${item.text}</p>
                        </div>
                    </a>
                `;
            });
        }

        popover.innerHTML = `
            <div class="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                <span class="font-bold text-xs uppercase tracking-wider text-primary">Notificaciones</span>
                <span class="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">${list.length}</span>
            </div>
            <div class="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                ${itemsHtml}
            </div>
        `;

        parent.appendChild(popover);
    });

    document.addEventListener('click', () => {
        const popover = document.getElementById('notification-popover');
        if (popover) popover.remove();
    });

    updateNotifications();

    window.addEventListener('storage', (e) => {
        if (!e.key || e.key === 'escarlu_sales' || e.key === 'escarlu_requests') {
            updateNotifications();
        }
    });

    // Check periodically for backend sync updates
    setInterval(updateNotifications, 4000);
}

// Override window.alert globally for ESCARLÚ with a custom premium modal
window.alert = function(message) {
    const modalId = 'custom-alert-modal';
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = "fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] opacity-0 transition-opacity duration-200 pointer-events-none";
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border-t-4 transform scale-95 transition-transform duration-200" id="custom-alert-card">
                <div class="flex items-center gap-3 mb-3" id="custom-alert-header">
                    <span class="material-symbols-outlined text-2xl" id="custom-alert-icon" style="font-variation-settings: 'FILL' 1;">info</span>
                    <h4 class="font-headline-md text-base font-bold" id="custom-alert-title">Atención</h4>
                </div>
                <p id="custom-alert-message" class="text-sm font-body-sm text-on-surface-variant mb-5 leading-relaxed"></p>
                <div class="flex justify-end">
                    <button id="custom-alert-btn" class="bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container px-5 py-2 rounded-xl font-label-lg text-xs uppercase font-bold shadow-sm transition-all active:scale-95">
                        Aceptar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('#custom-alert-btn').addEventListener('click', () => {
            modal.classList.add('opacity-0', 'pointer-events-none');
            modal.firstElementChild.classList.add('scale-95');
        });
    }
    
    // Determine dynamic type based on message text
    const lowerMsg = message.toLowerCase();
    const isSuccess = lowerMsg.includes('éxito') || lowerMsg.includes('exito') || lowerMsg.includes('aprobado') || lowerMsg.includes('creada') || lowerMsg.includes('enviada') || lowerMsg.includes('correcto');
    const isError = lowerMsg.includes('error') || lowerMsg.includes('insuficiente') || lowerMsg.includes('inválid') || lowerMsg.includes('invalidad') || lowerMsg.includes('incorrecto') || lowerMsg.includes('no tiene') || lowerMsg.includes('excede');
    const isInfo = lowerMsg.includes('sedes') || lowerMsg.includes('uds') || lowerMsg.includes('tallas') || lowerMsg.includes('existencias');
    
    const card = modal.querySelector('#custom-alert-card');
    const header = modal.querySelector('#custom-alert-header');
    const icon = modal.querySelector('#custom-alert-icon');
    const title = modal.querySelector('#custom-alert-title');
    
    if (isSuccess) {
        card.className = "bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border-t-4 border-green-500 transform scale-95 transition-transform duration-200";
        header.className = "flex items-center gap-3 mb-3 text-green-600";
        icon.textContent = "check_circle";
        title.textContent = "Éxito";
    } else if (isError) {
        card.className = "bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border-t-4 border-red-500 transform scale-95 transition-transform duration-200";
        header.className = "flex items-center gap-3 mb-3 text-red-600";
        icon.textContent = "error";
        title.textContent = "Error";
    } else if (isInfo) {
        card.className = "bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border-t-4 border-primary transform scale-95 transition-transform duration-200";
        header.className = "flex items-center gap-3 mb-3 text-primary";
        icon.textContent = "info";
        title.textContent = "Información de Stock";
    } else {
        card.className = "bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border-t-4 border-primary transform scale-95 transition-transform duration-200";
        header.className = "flex items-center gap-3 mb-3 text-primary";
        icon.textContent = "info";
        title.textContent = "Atención";
    }
    
    // Set message and show
    modal.querySelector('#custom-alert-message').textContent = message;
    modal.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        modal.firstElementChild.classList.remove('scale-95');
    }, 10);
};

// Modal Premium de Detalle de Sedes
window.showSedesModal = function(modelName, colorName, detailString) {
    const modalId = 'custom-sedes-modal';
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        // Fondo difuminado elegante con backdrop-filter
        modal.className = "fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-[99999] opacity-0 transition-opacity duration-200 pointer-events-none";
        document.body.appendChild(modal);
    }

    // Parsear el string plano desordenado a un HTML estructurado y elegante
    let rowsHtml = '';
    const lines = detailString.split('\\n').filter(line => line.trim().startsWith('-'));
    
    if (lines.length === 0) {
        rowsHtml = `<tr><td colspan="2" class="px-5 py-8 text-center text-on-surface-variant font-bold text-sm">Sin existencias registradas en ninguna sede.</td></tr>`;
    } else {
        lines.forEach(line => {
            // Ejemplo: "- Tienda Aviación: 170 uds (St:2, L:168)"
            const cleanLine = line.replace(/^- /, '').trim();
            const parts = cleanLine.split(':');
            const storeName = parts[0] || 'Sede';
            const rest = parts.slice(1).join(':').trim();
            
            // Separar cantidad y desglose por tallas
            const qtyMatch = rest.match(/^(\d+)\s+uds/);
            const qty = qtyMatch ? qtyMatch[1] : '0';
            
            const sizesMatch = rest.match(/\(([^)]+)\)/);
            const sizesDetail = sizesMatch ? sizesMatch[1] : '';

            rowsHtml += `
                <tr class="border-b border-outline-variant/40 hover:bg-surface-container-low transition-colors">
                    <td class="px-6 py-5">
                        <div class="font-bold text-base text-on-surface">${storeName}</div>
                    </td>
                    <td class="px-6 py-5 text-right">
                        <div class="font-extrabold text-base text-primary">${qty} uds</div>
                        <div class="text-[13px] text-on-surface-variant font-bold mt-1.5">${sizesDetail}</div>
                    </td>
                </tr>
            `;
        });
    }

    modal.innerHTML = `
        <div class="bg-white rounded-2xl max-w-xl w-full mx-4 shadow-2xl border-t-4 border-primary transform scale-95 transition-transform duration-200 overflow-hidden" id="custom-sedes-card">
            <!-- Cabecera -->
            <div class="p-6 border-b border-outline-variant/20 flex items-center justify-between">
                <div class="flex items-center gap-3.5">
                    <span class="material-symbols-outlined text-primary text-4xl" style="font-variation-settings: 'FILL' 1;">storefront</span>
                    <div>
                        <h4 class="text-xl font-bold text-black">${modelName}</h4>
                        <p class="text-sm text-on-surface-variant font-extrabold mt-1">Color: ${colorName}</p>
                    </div>
                </div>
                <button onclick="document.getElementById('custom-sedes-modal').classList.add('opacity-0', 'pointer-events-none')" class="text-on-surface-variant hover:text-black transition-colors">
                    <span class="material-symbols-outlined text-3xl">close</span>
                </button>
            </div>
            
            <!-- Cuerpo con la Tabla Premium -->
            <div class="p-6 max-h-[420px] overflow-y-auto">
                <p class="text-xs text-on-surface-variant/80 uppercase font-bold tracking-widest mb-4">Distribución por Sede</p>
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-primary-container/40 text-on-surface-variant text-sm font-bold uppercase tracking-wider">
                            <th class="px-6 py-3.5 rounded-l-lg">Sede / Tienda</th>
                            <th class="px-6 py-3.5 text-right rounded-r-lg">Cantidad (Tallas)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>

            <!-- Botón Cerrar en el Pie -->
            <div class="px-6 py-5 bg-surface-container-low border-t border-outline-variant/30 flex justify-end">
                <button onclick="document.getElementById('custom-sedes-modal').classList.add('opacity-0', 'pointer-events-none')" class="bg-primary text-on-primary hover:bg-primary/95 px-8 py-3 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95">
                    Entendido
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        modal.firstElementChild.classList.remove('scale-95');
    }, 10);
};

// Helper functions for garment types and dynamic models support
function getModelos() {
    const local = localStorage.getItem("escarlu_modelos");
    if (local) {
        try {
            return JSON.parse(local);
        } catch(e) {
            console.error("Error parsing escarlu_modelos", e);
        }
    }
    // Fallback static models with tipo
    return [
        { id_modelo: "MOD-001", tipo: "Polo", nombre: "Camisero MC", activo: true },
        { id_modelo: "MOD-002", tipo: "Polo", nombre: "Camisero ML", activo: true },
        { id_modelo: "MOD-003", tipo: "Polo", nombre: "Girasol MC", activo: true },
        { id_modelo: "MOD-004", tipo: "Polo", nombre: "Girasol ML", activo: true },
        { id_modelo: "MOD-005", tipo: "Polo", nombre: "Redondo MC", activo: true },
        { id_modelo: "MOD-006", tipo: "Polo", nombre: "Redondo ML", activo: true },
        { id_modelo: "MOD-007", tipo: "Polo", nombre: "Cuadrado MC", activo: true },
        { id_modelo: "MOD-008", tipo: "Polo", nombre: "Cuadrado ML", activo: true },
        { id_modelo: "MOD-009", tipo: "Polo", nombre: "Tania MC", activo: true },
        { id_modelo: "MOD-010", tipo: "Polo", nombre: "Tania ML", activo: true },
        { id_modelo: "MOD-011", tipo: "Polo", nombre: "Noemi MC", activo: true },
        { id_modelo: "MOD-012", tipo: "Polo", nombre: "Noemi ML", activo: true },
        { id_modelo: "MOD-013", tipo: "Polo", nombre: "Boton MC", activo: true },
        { id_modelo: "MOD-014", tipo: "Polo", nombre: "Boton ML", activo: true },
        { id_modelo: "MOD-015", tipo: "Short", nombre: "Short Pinza", activo: true },
        { id_modelo: "MOD-016", tipo: "Short", nombre: "Short Boton", activo: true },
        { id_modelo: "MOD-017", tipo: "Chompa", nombre: "Chompa Redondo", activo: true },
        { id_modelo: "MOD-018", tipo: "Chompa", nombre: "Chompa V", activo: true },
        { id_modelo: "MOD-019", tipo: "Buzo", nombre: "Buzo Normal", activo: true },
        { id_modelo: "MOD-020", tipo: "Polo", nombre: "Corazon MC", activo: true },
        { id_modelo: "MOD-021", tipo: "Polo", nombre: "Corazon ML", activo: true }
    ];
}

function updateModelNamesFromLocalStorage() {
    const local = localStorage.getItem("escarlu_modelos");
    if (local) {
        try {
            const models = JSON.parse(local);
            models.forEach(m => {
                MODEL_NAMES[m.id_modelo] = m.nombre;
            });
        } catch(e) {}
    }
}

// Initial call to sync MODEL_NAMES with localStorage cache
updateModelNamesFromLocalStorage();

// Helper to fetch stock for a model, color, and store from Supabase (with localStorage fallback)
async function getStockForProduct(model, color, storeId) {
    const client = getSupabaseClient();
    if (client) {
        try {
            let { data, error } = await client
                .from('stock')
                .select('cantidad, id_talla, tallas (nombre, orden)')
                .eq('id_modelo', model)
                .eq('id_color', color)
                .eq('id_sede', storeId);
            
            if (error) {
                // Fallback query without relationship in case of schema discrepancy
                const fallbackQuery = await client
                    .from('stock')
                    .select('cantidad, id_talla')
                    .eq('id_modelo', model)
                    .eq('id_color', color)
                    .eq('id_sede', storeId);
                data = fallbackQuery.data;
                error = fallbackQuery.error;
            }
            
            if (!error && data) {
                const result = data.map(row => ({
                    size: row.tallas?.nombre || TALLA_NAMES[row.id_talla] || 'M',
                    qty: row.cantidad,
                    order: row.tallas?.orden || { 'St': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5 }[row.tallas?.nombre || TALLA_NAMES[row.id_talla]] || 99
                }));
                result.sort((a, b) => a.order - b.order);
                return result;
            }
        } catch (e) {
            console.error("Error fetching stock from Supabase:", e);
        }
    }
    
    // Fallback to localStorage
    const inventory = JSON.parse(localStorage.getItem("escarlu_inventory")) || {};
    const stockObj = inventory[storeId]?.[model]?.[color] || {};
    const result = Object.entries(stockObj).map(([size, qty]) => {
        const order = { 'St': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5 }[size] || 99;
        return {
            size: size,
            qty: qty,
            order: order
        };
    });
    result.sort((a, b) => a.order - b.order);
    return result;
}

function getAllowedSizesForModel(modelId) {
    const models = JSON.parse(localStorage.getItem("escarlu_modelos")) || [];
    const model = models.find(m => m.id_modelo === modelId);
    if (!model) {
        if (modelId === "MOD-015" || modelId === "MOD-016") {
            return ["S", "M", "L", "XL"]; // Shorts
        }
        return ["St", "L"]; // Polos, Chompas, Buzos
    }
    
    const category = model.tipo.toLowerCase();
    if (category === "short") {
        return ["S", "M", "L", "XL"];
    } else {
        return ["St", "L"];
    }
}

// Estilos globales y dropdowns personalizados de ESCARLÚ
(function() {
    const styleOverride = document.createElement("style");
    styleOverride.innerHTML = `
        /* Ocultar select nativo cuando se inicializa el personalizado */
        .escarlu-select-hidden {
            display: none !important;
        }
        
        .escarlu-select-wrapper {
            position: relative;
            display: inline-block;
            width: 100%;
        }
        
        .escarlu-select-trigger {
            font-family: "Source Sans 3", sans-serif !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            color: #1c1b1b !important;
            border: 2px solid #cfc3cc !important;
            border-radius: 12px !important;
            padding: 10px 36px 10px 14px !important;
            background-color: #ffffff !important;
            cursor: pointer !important;
            display: flex;
            align-items: center;
            justify-content: justify;
            width: 100%;
            min-height: 44px;
            box-sizing: border-box;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            position: relative;
            user-select: none;
        }
        
        .escarlu-select-trigger:after {
            content: "";
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            border: 6px solid transparent;
            border-top-color: #745475;
            transition: transform 0.2s ease;
        }
        
        .escarlu-select-wrapper.open .escarlu-select-trigger {
            border-color: #745475 !important;
            box-shadow: 0 0 0 3px rgba(116, 84, 117, 0.15) !important;
        }
        
        .escarlu-select-wrapper.open .escarlu-select-trigger:after {
            transform: translateY(-50%) rotate(180deg);
        }
        
        .escarlu-select-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background-color: #ffffff;
            border: 2px solid #745475;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(116, 84, 117, 0.15);
            margin-top: 4px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 99999;
            display: none;
            box-sizing: border-box;
        }
        
        .escarlu-select-wrapper.open .escarlu-select-dropdown {
            display: block;
        }
        
        .escarlu-select-option {
            padding: 10px 14px;
            font-size: 13.5px;
            color: #4c444b;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.15s ease, color 0.15s ease;
            font-family: "Source Sans 3", sans-serif !important;
        }
        
        .escarlu-select-option:hover {
            background-color: #c8a2c8;
            color: #553757;
        }
        
        .escarlu-select-option.selected {
            background-color: #745475;
            color: #ffffff;
        }
    `;
    document.head.appendChild(styleOverride);

    function buildCustomDropdown(select) {
        if (select.dataset.customDropdownInitialized) return;
        select.dataset.customDropdownInitialized = "true";
        select.classList.add("escarlu-select-hidden");

        const wrapper = document.createElement("div");
        wrapper.className = "escarlu-select-wrapper";
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);

        const trigger = document.createElement("div");
        trigger.className = "escarlu-select-trigger";
        trigger.textContent = select.options[select.selectedIndex] ? select.options[select.selectedIndex].text : "Seleccionar...";
        wrapper.appendChild(trigger);

        const dropdown = document.createElement("div");
        dropdown.className = "escarlu-select-dropdown";
        wrapper.appendChild(dropdown);

        function updateWrapperWidth() {
            let maxText = "";
            Array.from(select.options).forEach(opt => {
                if (opt.text.length > maxText.length) {
                    maxText = opt.text;
                }
            });
            if (!maxText) return;

            const tempSpan = document.createElement("span");
            tempSpan.style.visibility = "hidden";
            tempSpan.style.position = "absolute";
            tempSpan.style.whiteSpace = "nowrap";
            tempSpan.style.fontFamily = '"Source Sans 3", sans-serif';
            tempSpan.style.fontSize = "14px";
            tempSpan.style.fontWeight = "600";
            tempSpan.textContent = maxText;
            document.body.appendChild(tempSpan);
            
            const idealWidth = tempSpan.offsetWidth + 50; 
            document.body.removeChild(tempSpan);

            // Asegurar un ancho mínimo para que se vea consistente, pero permitir que crezca si el texto es muy largo
            wrapper.style.width = Math.max(160, idealWidth) + "px";
        }

        function populateOptions() {
            dropdown.innerHTML = "";
            Array.from(select.options).forEach((opt, index) => {
                const optionEl = document.createElement("div");
                optionEl.className = "escarlu-select-option";
                if (index === select.selectedIndex) optionEl.classList.add("selected");
                optionEl.textContent = opt.text;
                optionEl.addEventListener("click", (e) => {
                    e.stopPropagation();
                    select.selectedIndex = index;
                    trigger.textContent = opt.text;
                    wrapper.classList.remove("open");
                    select.dispatchEvent(new Event("change"));
                });
                dropdown.appendChild(optionEl);
            });
        }

        populateOptions();
        updateWrapperWidth();

        // Reconstruir opciones e iniciar sincronización si cambian dinámicamente en el select original
        const observer = new MutationObserver(() => {
            populateOptions();
            updateWrapperWidth();
            const selectedOpt = select.options[select.selectedIndex];
            trigger.textContent = selectedOpt ? selectedOpt.text : "Seleccionar...";
        });
        observer.observe(select, { childList: true, characterData: true, subtree: true });

        // Evento change en el select original para actualizar visualmente la opción seleccionada
        select.addEventListener("change", () => {
            const selectedOpt = select.options[select.selectedIndex];
            trigger.textContent = selectedOpt ? selectedOpt.text : "Seleccionar...";
            populateOptions();
        });

        trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelectorAll(".escarlu-select-wrapper").forEach(w => {
                if (w !== wrapper) w.classList.remove("open");
            });
            wrapper.classList.toggle("open");
        });
    }

    // Monitorear e inicializar periódicamente
    setInterval(() => {
        document.querySelectorAll("select").forEach(select => {
            buildCustomDropdown(select);
        });
    }, 200);

    // Cerrar al hacer clic afuera
    document.addEventListener("click", () => {
        document.querySelectorAll(".escarlu-select-wrapper").forEach(w => w.classList.remove("open"));
    });
})();



