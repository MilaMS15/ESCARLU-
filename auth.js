// auth.js - Manejo de autenticacion con la tabla "usuarios" de Supabase

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const errorDiv = document.getElementById("login-error");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const email = emailInput.value.trim().toLowerCase();
            const passwordInput = document.getElementById("password");
            const password = passwordInput ? passwordInput.value : "";
            
            // Limpiar errores previos
            if (errorDiv) {
                errorDiv.classList.add("hidden");
                errorDiv.textContent = "";
            }

            const client = getSupabaseClient();
            if (!client) {
                alert("Error: El cliente de Supabase no esta inicializado.");
                return;
            }

            try {
                // Consultar la tabla "usuarios" de Supabase filtrando por email
                const { data: users, error } = await client
                    .from("usuarios")
                    .select("*")
                    .eq("email", email)
                    .eq("activo", true);

                if (error) throw error;

                if (!users || users.length === 0) {
                    showError("Usuario no registrado");
                    return;
                }

                const dbUser = users[0];

                // Validar contraseña (soporta columna 'contrasena' en Supabase y fallback inicial)
                const storedPassword = dbUser.contrasena;
                if (storedPassword) {
                    if (storedPassword !== password) {
                        showError("Contraseña incorrecta");
                        return;
                    }
                } else {
                    // Fallback para compatibilidad
                    let fallbackPass = "";
                    const lowerRol = (dbUser.rol || "").toLowerCase();
                    if (lowerRol === "admin" || lowerRol === "dueño") {
                        fallbackPass = "admin123";
                    } else if (lowerRol === "almacén" || lowerRol === "almacen") {
                        fallbackPass = "almacen123";
                    } else {
                        fallbackPass = "tienda123";
                    }

                    if (fallbackPass !== password) {
                        showError("Contraseña incorrecta");
                        return;
                    }
                }

                // Mapear los datos de la base de datos al formato esperado por el frontend
                let mappedRole = dbUser.rol;
                // Normalizar 'almacen' a 'almacen' para compatibilidad con rutas del frontend
                if (mappedRole === "almacén") {
                    mappedRole = "almacen";
                }

                const currentUser = {
                    id_usuario: dbUser.id_usuario,
                    email: dbUser.email,
                    role: mappedRole,
                    label: dbUser.nombre_completo,
                    storeId: dbUser.id_sede_asignada || (mappedRole === "almacen" ? "ALM-01" : "TDA-01")
                };

                // Guardar en el almacenamiento local del navegador
                localStorage.setItem("escarlu_current_user", JSON.stringify(currentUser));
                sessionStorage.setItem("escarlu_current_user", JSON.stringify(currentUser));

// Evaluar rol y redirigir con transición (splash de pantalla completa solo en login -> dashboard)
                const goTo = function(url) {
                    if (typeof window.escarluNavigate === 'function') {
                        window.escarluNavigate(url, 220, { splash: true });
                    } else {
                        window.location.href = url;
                    }
                };
                if (mappedRole === "admin" || mappedRole === "dueño") {
                    goTo("cajadueno.html");
                } else if (mappedRole === "almacen") {
                    goTo("Stockalmacen.html");
                } else if (mappedRole === "tienda") {
                    goTo("cajatienda.html");
                } else {
                    // Fallback
                    goTo("cajatienda.html");
                }

            } catch (err) {
                console.error("Error durante el inicio de sesion:", err);
                showError("Error de conexion al iniciar sesion.");
            }
        });
    }

    function showError(message) {
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove("hidden");
        } else {
            alert(message);
        }
    }
});
