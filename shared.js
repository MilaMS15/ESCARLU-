// Base de datos simulada y utilidades compartidas - ESCARLÚ

// Datos iniciales si no existen en localStorage
const DEFAULT_INVENTORY = {
    // Almacén Central
    "central": {
        "classic": { "blanco": { "S": 5, "M": 15, "L": 8, "XL": 5 }, "marino": { "S": 20, "M": 30, "L": 25, "XL": 15 }, "rosa": { "S": 12, "M": 18, "L": 14, "XL": 8 }, "lila": { "S": 25, "M": 12, "L": 18, "XL": 10 } },
        "slim": { "blanco": { "S": 15, "M": 20, "L": 18, "XL": 12 }, "marino": { "S": 10, "M": 15, "L": 8, "XL": 4 }, "rosa": { "S": 22, "M": 25, "L": 20, "XL": 10 }, "lila": { "S": 15, "M": 18, "L": 12, "XL": 8 } },
        "sport": { "blanco": { "S": 30, "M": 35, "L": 25, "XL": 20 }, "marino": { "S": 25, "M": 30, "L": 20, "XL": 15 }, "rosa": { "S": 8, "M": 12, "L": 10, "XL": 5 }, "lila": { "S": 14, "M": 16, "L": 12, "XL": 8 } },
        "premium": { "blanco": { "S": 8, "M": 10, "L": 6, "XL": 4 }, "marino": { "S": 12, "M": 14, "L": 10, "XL": 6 }, "rosa": { "S": 5, "M": 8, "L": 4, "XL": 2 }, "lila": { "S": 10, "M": 12, "L": 8, "XL": 4 } }
    },
    // Tienda 1: San Isidro
    "tienda_1": {
        "classic": { "blanco": { "S": 8, "M": 10, "L": 5, "XL": 3 }, "marino": { "S": 12, "M": 15, "L": 10, "XL": 6 }, "rosa": { "S": 5, "M": 8, "L": 4, "XL": 2 }, "lila": { "S": 10, "M": 8, "L": 6, "XL": 4 } },
        "slim": { "blanco": { "S": 6, "M": 8, "L": 5, "XL": 3 }, "marino": { "S": 8, "M": 10, "L": 6, "XL": 4 }, "rosa": { "S": 10, "M": 12, "L": 8, "XL": 5 }, "lila": { "S": 8, "M": 10, "L": 6, "XL": 4 } },
        "sport": { "blanco": { "S": 15, "M": 20, "L": 15, "XL": 10 }, "marino": { "S": 12, "M": 15, "L": 10, "XL": 8 }, "rosa": { "S": 4, "M": 6, "L": 4, "XL": 2 }, "lila": { "S": 6, "M": 8, "L": 5, "XL": 3 } },
        "premium": { "blanco": { "S": 4, "M": 5, "L": 3, "XL": 2 }, "marino": { "S": 6, "M": 8, "L": 5, "XL": 3 }, "rosa": { "S": 2, "M": 4, "L": 2, "XL": 1 }, "lila": { "S": 5, "M": 6, "L": 4, "XL": 2 } }
    },
    // Tienda 2: Miraflores
    "tienda_2": {
        "classic": { "blanco": { "S": 6, "M": 8, "L": 4, "XL": 2 }, "marino": { "S": 10, "M": 12, "L": 8, "XL": 5 }, "rosa": { "S": 4, "M": 6, "L": 3, "XL": 1 }, "lila": { "S": 8, "M": 6, "L": 4, "XL": 2 } },
        "slim": { "blanco": { "S": 5, "M": 6, "L": 4, "XL": 2 }, "marino": { "S": 6, "M": 8, "L": 4, "XL": 2 }, "rosa": { "S": 8, "M": 10, "L": 6, "XL": 3 }, "lila": { "S": 6, "M": 8, "L": 5, "XL": 3 } },
        "sport": { "blanco": { "S": 10, "M": 12, "L": 8, "XL": 6 }, "marino": { "S": 8, "M": 10, "L": 6, "XL": 4 }, "rosa": { "S": 3, "M": 4, "L": 3, "XL": 1 }, "lila": { "S": 4, "M": 6, "L": 4, "XL": 2 } },
        "premium": { "blanco": { "S": 3, "M": 4, "L": 2, "XL": 1 }, "marino": { "S": 4, "M": 6, "L": 3, "XL": 2 }, "rosa": { "S": 1, "M": 2, "L": 1, "XL": 0 }, "lila": { "S": 3, "M": 4, "L": 3, "XL": 1 } }
    },
    // Tienda 3: Surco
    "tienda_3": {
        "classic": { "blanco": { "S": 5, "M": 6, "L": 3, "XL": 2 }, "marino": { "S": 8, "M": 10, "L": 6, "XL": 4 }, "rosa": { "S": 3, "M": 4, "L": 2, "XL": 1 }, "lila": { "S": 6, "M": 5, "L": 3, "XL": 2 } },
        "slim": { "blanco": { "S": 4, "M": 5, "L": 3, "XL": 1 }, "marino": { "S": 5, "M": 6, "L": 3, "XL": 2 }, "rosa": { "S": 6, "M": 8, "L": 5, "XL": 2 }, "lila": { "S": 5, "M": 6, "L": 4, "XL": 2 } },
        "sport": { "blanco": { "S": 8, "M": 10, "L": 6, "XL": 4 }, "marino": { "S": 6, "M": 8, "L": 5, "XL": 3 }, "rosa": { "S": 2, "M": 3, "L": 2, "XL": 1 }, "lila": { "S": 3, "M": 4, "L": 3, "XL": 1 } },
        "premium": { "blanco": { "S": 2, "M": 3, "L": 1, "XL": 0 }, "marino": { "S": 3, "M": 4, "L": 2, "XL": 1 }, "rosa": { "S": 1, "M": 1, "L": 1, "XL": 0 }, "lila": { "S": 2, "M": 3, "L": 2, "XL": 1 } }
    },
    // Tienda 4: La Molina
    "tienda_4": {
        "classic": { "blanco": { "S": 7, "M": 8, "L": 4, "XL": 3 }, "marino": { "S": 10, "M": 12, "L": 8, "XL": 5 }, "rosa": { "S": 4, "M": 5, "L": 3, "XL": 2 }, "lila": { "S": 8, "M": 7, "L": 5, "XL": 3 } },
        "slim": { "blanco": { "S": 5, "M": 7, "L": 4, "XL": 2 }, "marino": { "S": 6, "M": 8, "L": 5, "XL": 3 }, "rosa": { "S": 8, "M": 9, "L": 6, "XL": 3 }, "lila": { "S": 6, "M": 7, "L": 5, "XL": 3 } },
        "sport": { "blanco": { "S": 10, "M": 12, "L": 8, "XL": 5 }, "marino": { "S": 8, "M": 10, "L": 6, "XL": 4 }, "rosa": { "S": 3, "M": 4, "L": 3, "XL": 1 }, "lila": { "S": 5, "M": 6, "L": 4, "XL": 2 } },
        "premium": { "blanco": { "S": 3, "M": 4, "L": 2, "XL": 1 }, "marino": { "S": 4, "M": 5, "L": 3, "XL": 2 }, "rosa": { "S": 1, "M": 2, "L": 1, "XL": 0 }, "lila": { "S": 3, "M": 4, "L": 2, "XL": 1 } }
    }
};

const DEFAULT_SALES = [
    { id: "TX-1001", storeId: "tienda_1", amount: 150.00, method: "efectivo", status: "aprobado", reference: "", client: "Carlos Fuentes", date: "2026-07-21T10:15:00" },
    { id: "TX-1002", storeId: "tienda_1", amount: 350.00, method: "yape", status: "pendiente", reference: "001-9482", client: "Maria Fernández", date: "2026-07-21T14:40:00" },
    { id: "TX-1003", storeId: "tienda_2", amount: 120.00, method: "yape", status: "pendiente", reference: "001-9483", client: "Juan Pérez", date: "2026-07-21T14:45:00" },
    { id: "TX-1004", storeId: "tienda_1", amount: 850.00, method: "plin", status: "pendiente", reference: "002-1102", client: "Andrea Gómez", date: "2026-07-21T14:35:00" },
    { id: "TX-1005", storeId: "tienda_3", amount: 600.00, method: "efectivo", status: "aprobado", reference: "", client: "Luis Torres", date: "2026-07-21T11:20:00" }
];

const DEFAULT_REQUESTS = [
    { id: "REQ-1001", type: "reposicion", origin: "central", destination: "tienda_1", model: "classic", color: "lila", size: "M", qty: 5, status: "pendiente", date: "2026-07-21T09:30:00" },
    { id: "REQ-1002", type: "traspaso", origin: "tienda_2", destination: "tienda_1", model: "slim", color: "blanco", size: "L", qty: 2, status: "pendiente", date: "2026-07-21T11:05:00" },
    { id: "REQ-1003", type: "reposicion", origin: "central", destination: "tienda_3", model: "premium", color: "marino", size: "S", qty: 3, status: "aprobado", date: "2026-07-21T08:15:00" }
];

const DEFAULT_EXPENSES = [
    { id: "EXP-1001", description: "Compra a Proveedor Hilandería S.A.", category: "proveedores", amount: 1200.00, date: "2026-07-20" },
    { id: "EXP-1002", description: "Costos de Fabricación - Lote Polos Piqué", category: "fabricacion", amount: 850.00, date: "2026-07-21" },
    { id: "EXP-1003", description: "Pago de Servicio de Luz (Almacén)", category: "servicios", amount: 350.00, date: "2026-07-21" }
];

const STORE_NAMES = {
    "tienda_1": "Tienda Santa Lucía",
    "tienda_2": "Tienda Generales Suplex",
    "tienda_3": "Tienda Generales Pasadizo",
    "tienda_4": "Tienda Aviación"
};

const MODEL_NAMES = {
    "classic": "Polo Clásico Piqué",
    "slim": "Polo Slim Fit Mercerizado",
    "sport": "Polo Técnico Deportivo",
    "premium": "Polo Premium Seda/Algodón"
};

const COLOR_NAMES = {
    "blanco": "Blanco",
    "marino": "Azul Marino",
    "rosa": "Rosa Pastel",
    "lila": "Lila Pastel"
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
    "admin@escarlu.com": { email: "admin@escarlu.com", role: "admin", label: "Administrador / Dueño", storeId: "" },
    "almacen@escarlu.com": { email: "almacen@escarlu.com", role: "almacen", label: "Almacén Central", storeId: "" },
    "tienda1@escarlu.com": { email: "tienda1@escarlu.com", role: "tienda", label: "Tienda Santa Lucía", storeId: "tienda_1" },
    "tienda2@escarlu.com": { email: "tienda2@escarlu.com", role: "tienda", label: "Tienda Generales Suplex", storeId: "tienda_2" },
    "tienda3@escarlu.com": { email: "tienda3@escarlu.com", role: "tienda", label: "Tienda Generales Pasadizo", storeId: "tienda_3" },
    "tienda4@escarlu.com": { email: "tienda4@escarlu.com", role: "tienda", label: "Tienda Aviación", storeId: "tienda_4" }
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
        const tiendaPages = ["cajatienda.html", "solitienda.html", "registrarventa.html", "registrarventatienda.html", "stocktienda.html", "solicitud.html", "atenderpedidos.html"];

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

