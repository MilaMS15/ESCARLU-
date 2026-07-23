// Base de datos simulada y utilidades compartidas - ESCARLÚ

let supabaseClient = null;

// Cargar dinámicamente dependencias de Supabase y config.js
(function() {
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
})();

function getSupabaseClient() {
    if (!supabaseClient && window.supabase && typeof SUPABASE_URL !== 'undefined') {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
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
    } else if (key === 'escarlu_sales') {
        syncSalesToSupabase(JSON.parse(value));
    } else if (key === 'escarlu_requests') {
        syncRequestsToSupabase(JSON.parse(value));
    } else if (key === 'escarlu_expenses') {
        syncExpensesToSupabase(JSON.parse(value));
    }
};

async function syncInventoryToSupabase(localInv) {
    const client = getSupabaseClient();
    if (!client) return;
    for (const [storeId, models] of Object.entries(localInv)) {
        for (const [modelId, colors] of Object.entries(models)) {
            for (const [colorId, sizes] of Object.entries(colors)) {
                for (const [sizeName, qty] of Object.entries(sizes)) {
                    const tallaId = TALLA_KEYS[sizeName];
                    if (!tallaId) continue;
                    const stockId = `STK-${storeId}-${modelId}-${colorId}-${tallaId}`;
                    await client.from('stock').upsert({
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
}

async function syncRequestsToSupabase(localReqs) {
    const client = getSupabaseClient();
    if (!client) return;
    for (const req of localReqs) {
        const tallaId = TALLA_KEYS[req.size] || 'TAL-03';
        await client.from('solicitudes_traspaso').upsert({
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
}

async function syncSalesToSupabase(localSales) {
    const client = getSupabaseClient();
    if (!client) return;
    const user = getCurrentUser();
    for (const sale of localSales) {
        const userId = user ? user.id_usuario : 'USR-03';
        // Sync sale header
        await client.from('ventas').upsert({
            id_venta: sale.id,
            id_sede: sale.storeId,
            id_usuario: userId,
            fecha_hora: sale.date,
            monto_total: sale.amount,
            metodo_pago: sale.method,
            estado: sale.status,
            referencia: sale.reference || null
        });
        // Sync sale line items to detalle_venta
        if (sale.items && sale.items.length > 0) {
            for (let i = 0; i < sale.items.length; i++) {
                const item = sale.items[i];
                const tallaId = TALLA_KEYS[item.size] || 'TAL-03';
                const subtotal = (item.price || 0) * (item.qty || 1);
                await client.from('detalle_venta').upsert({
                    id_detalle: `DV-${sale.id}-${i + 1}`,
                    id_venta: sale.id,
                    id_modelo: item.model,
                    id_color: item.color,
                    id_talla: tallaId,
                    cantidad: item.qty,
                    precio_unitario: item.price || 0,
                    subtotal: subtotal
                });
            }
        }
    }
}

async function syncExpensesToSupabase(localExpenses) {
    const client = getSupabaseClient();
    if (!client) return;
    for (const exp of localExpenses) {
        await client.from('gastos').upsert({
            id_gasto: exp.id,
            descripcion: exp.description,
            categoria: exp.category === 'fabricacion' ? 'fabricación' : exp.category,
            monto: exp.amount,
            fecha: exp.date,
            id_sede: exp.storeId || 'CTR-01'
        });
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

    // 1. Download Stock
    const { data: stockData } = await client.from('stock').select('*');
    if (stockData) {
        const inventory = {};
        stockData.forEach(row => {
            const storeId = row.id_sede;
            const modelId = row.id_modelo;
            const colorId = row.id_color;
            const sizeName = TALLA_NAMES[row.id_talla];
            if (!sizeName) return;

            if (!inventory[storeId]) inventory[storeId] = {};
            if (!inventory[storeId][modelId]) inventory[storeId][modelId] = {};
            if (!inventory[storeId][modelId][colorId]) inventory[storeId][modelId][colorId] = {};
            inventory[storeId][modelId][colorId][sizeName] = row.cantidad;
        });
        const invStr = JSON.stringify(inventory);
        originalSetItem.call(localStorage, 'escarlu_inventory', invStr);
        triggerStorageUpdate('escarlu_inventory', invStr);
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
            storeId: row.id_sede
        }));
        const expStr = JSON.stringify(expenses);
        originalSetItem.call(localStorage, 'escarlu_expenses', expStr);
        triggerStorageUpdate('escarlu_expenses', expStr);
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
    "MOD-019": "Buzo Normal"
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
        const tiendaPages = ["cajatienda.html", "solitienda.html", "registrarventa.html", "stocktienda.html", "solicitud.html", "atenderpedidos.html"];

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
            <div class="w-14 h-14 rounded-xl bg-white overflow-hidden shadow-sm border border-outline-variant flex items-center justify-center">
                <img src="logo.jpeg" alt="Escarlú Logo" class="object-contain w-full h-full p-1" onerror="this.src='https://placehold.co/80x80?text=ESCARL%C3%9A'"/>
            </div>
            <div class="text-center">
                <h1 class="font-headline-md text-xl text-primary font-bold tracking-tight">ESCARLÚ</h1>
                <p class="font-body-sm text-[11px] text-on-surface-variant font-semibold mt-0.5">${user.label}</p>
            </div>
        </div>
    `;
    
    // Links según Rol especificado exactamente por el usuario
    let linksHtml = "";
    
    if (user.role === "admin") {
        // DUEÑO: cajadueno.html, cortesdueno.html, stockgeneraldueno.html
        linksHtml += `
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'cajadueno' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="cajadueno.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${activePage === 'cajadueno' ? 1 : 0};">account_balance_wallet</span>
                <span class="font-label-lg text-label-lg">Caja Dueño</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'cortesdueno' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="cortesdueno.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${activePage === 'cortesdueno' ? 1 : 0};">content_cut</span>
                <span class="font-label-lg text-label-lg">Cortes Dueño</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'stockgeneraldueno' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="stockgeneraldueno.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${activePage === 'stockgeneraldueno' ? 1 : 0};">inventory_2</span>
                <span class="font-label-lg text-label-lg">Stock General</span>
            </a>
        `;
    } else if (user.role === "almacen") {
        // ALMACÉN: historialmacen.html, ingresoprendalmacen.html, solicitudpendientealmacen.html, Stockalmacen.html
        linksHtml += `
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'historialmacen' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="historialmacen.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${activePage === 'historialmacen' ? 1 : 0};">history</span>
                <span class="font-label-lg text-label-lg">Historial Almacén</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'ingresoprendalmacen' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="ingresoprendalmacen.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${activePage === 'ingresoprendalmacen' ? 1 : 0};">add_box</span>
                <span class="font-label-lg text-label-lg">Ingreso de Prendas</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'solicitudpendientealmacen' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="solicitudpendientealmacen.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${activePage === 'solicitudpendientealmacen' ? 1 : 0};">pending_actions</span>
                <span class="font-label-lg text-label-lg">Solicitudes Pendientes</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'Stockalmacen' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="Stockalmacen.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${activePage === 'Stockalmacen' ? 1 : 0};">inventory_2</span>
                <span class="font-label-lg text-label-lg">Stock Almacén</span>
            </a>
        `;
    } else {
        // TIENDA: cajatienda.html, solitienda.html, atenderpedidos.html, registrarventa.html, stocktienda.html
        linksHtml += `
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'cajatienda' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="cajatienda.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${activePage === 'cajatienda' ? 1 : 0};">storefront</span>
                <span class="font-label-lg text-label-lg">Caja Chica</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'solitienda' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="solitienda.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${activePage === 'solitienda' ? 1 : 0};">swap_horiz</span>
                <span class="font-label-lg text-label-lg">Pedir Stock</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'atenderpedidos' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="atenderpedidos.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${activePage === 'atenderpedidos' ? 1 : 0};">assignment_turned_in</span>
                <span class="font-label-lg text-label-lg">Atender Pedidos</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'registrarventa' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="registrarventa.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${activePage === 'registrarventa' ? 1 : 0};">point_of_sale</span>
                <span class="font-label-lg text-label-lg">Registrar Venta</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] cursor-pointer transition-all duration-200 ${activePage === 'stocktienda' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-highest'}" href="stocktienda.html">
                <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${activePage === 'stocktienda' ? 1 : 0};">inventory</span>
                <span class="font-label-lg text-label-lg">Stock Tienda</span>
            </a>
        `;
    }
    
    sidenav.innerHTML = `
        ${brandHeaderHtml}
        <div class="flex flex-col gap-2 flex-1 overflow-y-auto px-2">
            ${linksHtml}
        </div>
        <div class="mt-auto pt-2 border-t border-outline-variant px-2">
            <button id="logout-btn" class="w-full flex items-center gap-4 text-on-surface-variant py-2.5 px-4 hover:bg-error-container hover:text-on-error-container transition-all duration-200 rounded-lg min-h-[48px] text-left">
                <span class="material-symbols-outlined">logout</span>
                <span class="font-label-lg text-label-lg font-semibold">Cerrar Sesión</span>
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
            <img src="logo.jpeg" alt="Escarlú Logo" class="w-10 h-10 rounded object-contain bg-white border border-outline-variant p-0.5" onerror="this.src='https://placehold.co/50x50?text=ES'"/>
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
                <span class="font-label-lg">Caja Dueño</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] transition-colors ${activePage === 'cortesdueno' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}" href="cortesdueno.html">
                <span class="material-symbols-outlined">content_cut</span>
                <span class="font-label-lg">Cortes Dueño</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] transition-colors ${activePage === 'stockgeneraldueno' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}" href="stockgeneraldueno.html">
                <span class="material-symbols-outlined">inventory_2</span>
                <span class="font-label-lg">Stock General</span>
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
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] transition-colors ${activePage === 'solicitudpendientealmacen' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}" href="solicitudpendientealmacen.html">
                <span class="material-symbols-outlined">pending_actions</span>
                <span class="font-label-lg">Solicitudes Pendientes</span>
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
                <span class="font-label-lg">Caja Chica</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] transition-colors ${activePage === 'solitienda' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}" href="solitienda.html">
                <span class="material-symbols-outlined">swap_horiz</span>
                <span class="font-label-lg">Pedir Stock</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] transition-colors ${activePage === 'atenderpedidos' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}" href="atenderpedidos.html">
                <span class="material-symbols-outlined">assignment_turned_in</span>
                <span class="font-label-lg">Atender Pedidos</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] transition-colors ${activePage === 'registrarventa' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}" href="registrarventa.html">
                <span class="material-symbols-outlined">point_of_sale</span>
                <span class="font-label-lg">Registrar Venta</span>
            </a>
            <a class="flex items-center gap-4 p-4 rounded-lg min-h-[56px] transition-colors ${activePage === 'stocktienda' ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}" href="stocktienda.html">
                <span class="material-symbols-outlined">inventory</span>
                <span class="font-label-lg">Stock Tienda</span>
            </a>
        `;
    }

    drawerContent.className = "w-64 bg-surface-container h-full flex flex-col py-6 shadow-xl transition-transform duration-300 -translate-x-full";
    drawerContent.innerHTML = `
        <div class="px-6 mb-6 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <img src="logo.jpeg" alt="Escarlú" class="w-8 h-8 rounded object-contain bg-white p-0.5 border border-outline-variant"/>
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

// Inicialización de cada página
document.addEventListener("DOMContentLoaded", () => {
    initDB();
    checkAuth();
    
    // Descarga inicial de Supabase con reintentos para asegurar carga del script
    downloadFromSupabase();
    setTimeout(downloadFromSupabase, 500);
    setTimeout(downloadFromSupabase, 1500);

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
    }
});

