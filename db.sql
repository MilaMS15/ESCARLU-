-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.sedes (
  id_sede character varying NOT NULL,
  ubicacion text NOT NULL,
  tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['almacén'::character varying, 'tienda'::character varying, 'admin'::character varying]::text[])),
  direccion_completa text,
  telefono character varying,
  activo boolean NOT NULL DEFAULT true,
  CONSTRAINT sedes_pkey PRIMARY KEY (id_sede)
);
CREATE TABLE public.modelos (
  id_modelo character varying NOT NULL,
  tipo character varying NOT NULL,
  nombre text NOT NULL,
  tela character varying NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  CONSTRAINT modelos_pkey PRIMARY KEY (id_modelo)
);
CREATE TABLE public.colores (
  id_color character varying NOT NULL,
  nombre text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  CONSTRAINT colores_pkey PRIMARY KEY (id_color)
);
CREATE TABLE public.tallas (
  id_talla character varying NOT NULL,
  nombre character varying NOT NULL,
  orden integer NOT NULL,
  CONSTRAINT tallas_pkey PRIMARY KEY (id_talla)
);
CREATE TABLE public.usuarios (
  id_usuario character varying NOT NULL,
  nombre_completo text NOT NULL,
  email character varying NOT NULL UNIQUE,
  rol character varying NOT NULL CHECK (rol::text = ANY (ARRAY['admin'::character varying, 'almacén'::character varying, 'tienda'::character varying]::text[])),
  cargo_encargo text,
  id_sede_asignada character varying,
  telefono character varying,
  activo boolean NOT NULL DEFAULT true,
  fecha_ingreso date,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario),
  CONSTRAINT usuarios_id_sede_asignada_fkey FOREIGN KEY (id_sede_asignada) REFERENCES public.sedes(id_sede)
);
CREATE TABLE public.stock (
  id_stock character varying NOT NULL,
  id_sede character varying NOT NULL,
  id_modelo character varying NOT NULL,
  id_color character varying NOT NULL,
  id_talla character varying NOT NULL,
  cantidad integer NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
  stock_minimo integer NOT NULL DEFAULT 0,
  ultima_actualizacion timestamp with time zone,
  CONSTRAINT stock_pkey PRIMARY KEY (id_stock),
  CONSTRAINT stock_id_sede_fkey FOREIGN KEY (id_sede) REFERENCES public.sedes(id_sede),
  CONSTRAINT stock_id_modelo_fkey FOREIGN KEY (id_modelo) REFERENCES public.modelos(id_modelo),
  CONSTRAINT stock_id_color_fkey FOREIGN KEY (id_color) REFERENCES public.colores(id_color),
  CONSTRAINT stock_id_talla_fkey FOREIGN KEY (id_talla) REFERENCES public.tallas(id_talla)
);
CREATE TABLE public.ventas (
  id_venta character varying NOT NULL,
  id_sede character varying NOT NULL,
  id_usuario character varying NOT NULL,
  fecha_hora timestamp with time zone NOT NULL DEFAULT now(),
  monto_total numeric NOT NULL CHECK (monto_total >= 0::numeric),
  metodo_pago character varying NOT NULL CHECK (metodo_pago::text = ANY (ARRAY['efectivo'::character varying, 'yape'::character varying, 'plin'::character varying]::text[])),
  estado character varying NOT NULL DEFAULT 'pendiente'::character varying CHECK (estado::text = ANY (ARRAY['aprobado'::character varying, 'pendiente'::character varying, 'rechazado'::character varying]::text[])),
  referencia character varying,
  CONSTRAINT ventas_pkey PRIMARY KEY (id_venta),
  CONSTRAINT ventas_id_sede_fkey FOREIGN KEY (id_sede) REFERENCES public.sedes(id_sede),
  CONSTRAINT ventas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.detalle_venta (
  id_detalle character varying NOT NULL,
  id_venta character varying NOT NULL,
  id_modelo character varying NOT NULL,
  id_color character varying NOT NULL,
  id_talla character varying NOT NULL,
  cantidad integer NOT NULL CHECK (cantidad > 0),
  precio_unitario numeric NOT NULL CHECK (precio_unitario >= 0::numeric),
  subtotal numeric NOT NULL CHECK (subtotal >= 0::numeric),
  CONSTRAINT detalle_venta_pkey PRIMARY KEY (id_detalle),
  CONSTRAINT detalle_venta_id_venta_fkey FOREIGN KEY (id_venta) REFERENCES public.ventas(id_venta),
  CONSTRAINT detalle_venta_id_modelo_fkey FOREIGN KEY (id_modelo) REFERENCES public.modelos(id_modelo),
  CONSTRAINT detalle_venta_id_color_fkey FOREIGN KEY (id_color) REFERENCES public.colores(id_color),
  CONSTRAINT detalle_venta_id_talla_fkey FOREIGN KEY (id_talla) REFERENCES public.tallas(id_talla)
);
CREATE TABLE public.solicitudes_traspaso (
  id_solicitud character varying NOT NULL,
  tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['reposición'::character varying, 'traspaso'::character varying]::text[])),
  id_sede_origen character varying NOT NULL,
  id_sede_destino character varying NOT NULL,
  id_modelo character varying NOT NULL,
  id_color character varying NOT NULL,
  id_talla character varying NOT NULL,
  cantidad integer NOT NULL CHECK (cantidad > 0),
  estado character varying NOT NULL DEFAULT 'pendiente'::character varying CHECK (estado::text = ANY (ARRAY['pendiente'::character varying, 'aprobado'::character varying, 'rechazado'::character varying]::text[])),
  fecha_solicitud timestamp with time zone NOT NULL DEFAULT now(),
  fecha_atencion timestamp with time zone,
  atendido_por character varying,
  CONSTRAINT solicitudes_traspaso_pkey PRIMARY KEY (id_solicitud),
  CONSTRAINT solicitudes_traspaso_id_sede_origen_fkey FOREIGN KEY (id_sede_origen) REFERENCES public.sedes(id_sede),
  CONSTRAINT solicitudes_traspaso_id_sede_destino_fkey FOREIGN KEY (id_sede_destino) REFERENCES public.sedes(id_sede),
  CONSTRAINT solicitudes_traspaso_id_modelo_fkey FOREIGN KEY (id_modelo) REFERENCES public.modelos(id_modelo),
  CONSTRAINT solicitudes_traspaso_id_color_fkey FOREIGN KEY (id_color) REFERENCES public.colores(id_color),
  CONSTRAINT solicitudes_traspaso_id_talla_fkey FOREIGN KEY (id_talla) REFERENCES public.tallas(id_talla),
  CONSTRAINT solicitudes_traspaso_atendido_por_fkey FOREIGN KEY (atendido_por) REFERENCES public.usuarios(id_usuario)
);
CREATE TABLE public.gastos (
  id_gasto character varying NOT NULL,
  descripcion text NOT NULL,
  categoria character varying NOT NULL CHECK (categoria::text = ANY (ARRAY['proveedores'::character varying, 'fabricación'::character varying, 'servicios'::character varying, 'otro'::character varying]::text[])),
  monto numeric NOT NULL CHECK (monto >= 0::numeric),
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  id_sede character varying,
  comprobante boolean NOT NULL DEFAULT false,
  CONSTRAINT gastos_pkey PRIMARY KEY (id_gasto),
  CONSTRAINT gastos_id_sede_fkey FOREIGN KEY (id_sede) REFERENCES public.sedes(id_sede)
);
CREATE TABLE public.moldes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  modelo text NOT NULL,
  talla text NOT NULL,
  nombre_pieza text NOT NULL,
  dxf_url text NOT NULL,
  rotacion_maxima numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT moldes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tendidas_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ancho_util numeric NOT NULL,
  largo_max numeric NOT NULL,
  incluir_doblez boolean DEFAULT false,
  modelo_seleccionado jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT tendidas_config_pkey PRIMARY KEY (id)
);
CREATE TABLE public.resultados_trazo (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tendida_config_id uuid,
  porc_aprov numeric,
  proc_merma numeric,
  largo_usado numeric,
  consumo_tela_por_prenda numeric,
  detalle_piezas_colocadas jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT resultados_trazo_pkey PRIMARY KEY (id),
  CONSTRAINT resultados_trazo_tendida_config_id_fkey FOREIGN KEY (tendida_config_id) REFERENCES public.tendidas_config(id)
);