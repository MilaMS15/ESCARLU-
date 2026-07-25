-- MIGRACIÓN SQL PARA SUPABASE: REDISEÑO DE MOLDES Y RECETAS
-- Ejecuta este script en el SQL Editor de tu Dashboard de Supabase

BEGIN;

-- 1. Eliminar tablas antiguas si existen (para evitar conflictos de esquema)
DROP TABLE IF EXISTS public.recetas_moldes CASCADE;
DROP TABLE IF EXISTS public.moldes CASCADE;

-- 2. Crear nueva tabla de moldes (Catálogo de archivos DXF)
CREATE TABLE public.moldes (
  nombre_molde character varying NOT NULL,
  dxf_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT moldes_pkey PRIMARY KEY (nombre_molde)
);

-- 3. Crear nueva tabla de recetas (BOM - Relación de piezas y cantidades)
CREATE TABLE public.recetas_moldes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  id_modelo character varying NOT NULL,
  id_talla character varying NOT NULL,
  nombre_molde character varying NOT NULL,
  cantidad integer NOT NULL CHECK (cantidad > 0),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT recetas_moldes_pkey PRIMARY KEY (id),
  CONSTRAINT recetas_moldes_id_modelo_fkey FOREIGN KEY (id_modelo) REFERENCES public.modelos(id_modelo) ON DELETE CASCADE,
  CONSTRAINT recetas_moldes_id_talla_fkey FOREIGN KEY (id_talla) REFERENCES public.tallas(id_talla) ON DELETE CASCADE,
  CONSTRAINT recetas_moldes_nombre_molde_fkey FOREIGN KEY (nombre_molde) REFERENCES public.moldes(nombre_molde) ON DELETE CASCADE
);

-- Habilitar permisos de lectura pública para las tablas (Bypassing RLS policies for read simplicity)
ALTER TABLE public.moldes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recetas_moldes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura publica de moldes" ON public.moldes FOR SELECT USING (true);
CREATE POLICY "Permitir lectura publica de recetas" ON public.recetas_moldes FOR SELECT USING (true);

-- 4. Insertar los 38 moldes únicos (Catálogo de archivos DXF)
INSERT INTO public.moldes (nombre_molde, dxf_url) VALUES
('Delantero Camisero L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Camisero%20L.dxf'),
('Delantero Camisero St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Camisero%20St.dxf'),
('Delantero Corazon L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Corazon%20L.dxf'),
('Delantero Corazon St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Corazon%20St.dxf'),
('Delantero Cuadrado L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Cuadrado%20L.dxf'),
('Delantero Cuadrado St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Cuadrado%20St.dxf'),
('Delantero Girasol L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Girasol%20L.dxf'),
('Delantero Girasol St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Girasol%20St.dxf'),
('Delantero Noemi L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Noemi%20L.dxf'),
('Delantero Noemi St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Noemi%20St.dxf'),
('Delantero Redondo MC L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Redondo%20MC%20L.dxf'),
('Delantero Redondo MC St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Redondo%20MC%20St.dxf'),
('Delantero Redondo ML L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Redondo%20ML%20L.dxf'),
('Delantero Redondo ML St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Redondo%20ML%20St.dxf'),
('Delantero Tania L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Tania%20L.dxf'),
('Delantero Tania St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Tania%20St.dxf'),
('Espalda Camisero L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Camisero%20L.dxf'),
('Espalda Camisero St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Camisero%20St.dxf'),
('Espalda Corazon L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Corazon%20L.dxf'),
('Espalda Corazon St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Corazon%20St.dxf'),
('Espalda Cuadrado L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Cuadrado%20L.dxf'),
('Espalda Cuadrado St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Cuadrado%20St.dxf'),
('Espalda Girasol L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Girasol%20L.dxf'),
('Espalda Girasol St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Girasol%20St.dxf'),
('Espalda Noemi L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Noemi%20L.dxf'),
('Espalda Noemi St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Noemi%20St.dxf'),
('Espalda Redondo L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Redondo%20L.dxf'),
('Espalda Redondo St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Redondo%20St.dxf'),
('Espalda Tania L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Tania%20L.dxf'),
('Espalda Tania St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Tania%20St.dxf'),
('Manga Corta L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20L.dxf'),
('Manga Corta St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20St.dxf'),
('Manga Corta Tania L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20Tania%20L.dxf'),
('Manga Corta Tania St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20Tania%20St.dxf'),
('Manga Larga L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20L.dxf'),
('Manga Larga St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20St.dxf'),
('Manga Larga Tania L', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20Tania%20L.dxf'),
('Manga Larga Tania St', 'https://pbqplcasneqkhvvywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20Tania%20St.dxf');

-- 5. Insertar las 84 relaciones de recetas (Modelos + Tallas + Piezas + Cantidades)
INSERT INTO public.recetas_moldes (id_modelo, id_talla, nombre_molde, cantidad) VALUES
('MOD-001', 'TAL-04', 'Delantero Camisero L', 2),
('MOD-001', 'TAL-04', 'Espalda Camisero L', 1),
('MOD-001', 'TAL-04', 'Manga Corta L', 2),
('MOD-001', 'TAL-01', 'Delantero Camisero St', 2),
('MOD-001', 'TAL-01', 'Espalda Camisero St', 1),
('MOD-001', 'TAL-01', 'Manga Corta St', 2),
('MOD-002', 'TAL-04', 'Delantero Camisero L', 2),
('MOD-002', 'TAL-04', 'Espalda Camisero L', 1),
('MOD-002', 'TAL-04', 'Manga Larga L', 2),
('MOD-002', 'TAL-01', 'Delantero Camisero St', 2),
('MOD-002', 'TAL-01', 'Espalda Camisero St', 1),
('MOD-002', 'TAL-01', 'Manga Larga St', 2),
('MOD-020', 'TAL-04', 'Delantero Corazon L', 2),
('MOD-020', 'TAL-04', 'Espalda Corazon L', 1),
('MOD-020', 'TAL-04', 'Manga Corta L', 2),
('MOD-020', 'TAL-01', 'Delantero Corazon St', 2),
('MOD-020', 'TAL-01', 'Espalda Corazon St', 1),
('MOD-020', 'TAL-01', 'Manga Corta St', 2),
('MOD-021', 'TAL-04', 'Delantero Corazon L', 2),
('MOD-021', 'TAL-04', 'Espalda Corazon L', 1),
('MOD-021', 'TAL-04', 'Manga Larga L', 2),
('MOD-021', 'TAL-01', 'Delantero Corazon St', 2),
('MOD-021', 'TAL-01', 'Espalda Corazon St', 1),
('MOD-021', 'TAL-01', 'Manga Larga St', 2),
('MOD-007', 'TAL-04', 'Delantero Cuadrado L', 2),
('MOD-007', 'TAL-04', 'Espalda Cuadrado L', 1),
('MOD-007', 'TAL-04', 'Manga Corta L', 2),
('MOD-007', 'TAL-01', 'Delantero Cuadrado St', 2),
('MOD-007', 'TAL-01', 'Espalda Cuadrado St', 1),
('MOD-007', 'TAL-01', 'Manga Corta St', 2),
('MOD-008', 'TAL-04', 'Delantero Cuadrado L', 2),
('MOD-008', 'TAL-04', 'Espalda Cuadrado L', 1),
('MOD-008', 'TAL-04', 'Manga Larga L', 2),
('MOD-008', 'TAL-01', 'Delantero Cuadrado St', 2),
('MOD-008', 'TAL-01', 'Espalda Cuadrado St', 1),
('MOD-008', 'TAL-01', 'Manga Larga St', 2),
('MOD-003', 'TAL-04', 'Delantero Girasol L', 2),
('MOD-003', 'TAL-04', 'Espalda Girasol L', 1),
('MOD-003', 'TAL-04', 'Manga Corta L', 2),
('MOD-003', 'TAL-01', 'Delantero Girasol St', 2),
('MOD-003', 'TAL-01', 'Espalda Girasol St', 1),
('MOD-003', 'TAL-01', 'Manga Corta St', 2),
('MOD-004', 'TAL-04', 'Delantero Girasol L', 2),
('MOD-004', 'TAL-04', 'Espalda Girasol L', 1),
('MOD-004', 'TAL-04', 'Manga Larga L', 2),
('MOD-004', 'TAL-01', 'Delantero Girasol St', 2),
('MOD-004', 'TAL-01', 'Espalda Girasol St', 1),
('MOD-004', 'TAL-01', 'Manga Larga St', 2),
('MOD-011', 'TAL-04', 'Delantero Noemi L', 2),
('MOD-011', 'TAL-04', 'Espalda Noemi L', 1),
('MOD-011', 'TAL-04', 'Manga Corta L', 2),
('MOD-011', 'TAL-01', 'Delantero Noemi St', 2),
('MOD-011', 'TAL-01', 'Espalda Noemi St', 1),
('MOD-011', 'TAL-01', 'Manga Corta St', 2),
('MOD-012', 'TAL-04', 'Delantero Noemi L', 2),
('MOD-012', 'TAL-04', 'Espalda Noemi L', 1),
('MOD-012', 'TAL-04', 'Manga Larga L', 2),
('MOD-012', 'TAL-01', 'Delantero Noemi St', 2),
('MOD-012', 'TAL-01', 'Espalda Noemi St', 1),
('MOD-012', 'TAL-01', 'Manga Larga St', 2),
('MOD-005', 'TAL-04', 'Delantero Redondo MC L', 2),
('MOD-005', 'TAL-04', 'Espalda Redondo L', 1),
('MOD-005', 'TAL-04', 'Manga Corta L', 2),
('MOD-005', 'TAL-01', 'Delantero Redondo MC St', 2),
('MOD-005', 'TAL-01', 'Espalda Redondo St', 1),
('MOD-005', 'TAL-01', 'Manga Corta St', 2),
('MOD-006', 'TAL-04', 'Delantero Redondo ML L', 2),
('MOD-006', 'TAL-04', 'Espalda Redondo L', 1),
('MOD-006', 'TAL-04', 'Manga Larga L', 2),
('MOD-006', 'TAL-01', 'Delantero Redondo ML St', 2),
('MOD-006', 'TAL-01', 'Espalda Redondo St', 1),
('MOD-006', 'TAL-01', 'Manga Larga St', 2),
('MOD-009', 'TAL-04', 'Delantero Tania L', 2),
('MOD-009', 'TAL-04', 'Espalda Tania L', 1),
('MOD-009', 'TAL-04', 'Manga Corta Tania L', 2),
('MOD-009', 'TAL-01', 'Delantero Tania St', 2),
('MOD-009', 'TAL-01', 'Espalda Tania St', 1),
('MOD-009', 'TAL-01', 'Manga Corta Tania St', 2),
('MOD-010', 'TAL-04', 'Delantero Tania L', 2),
('MOD-010', 'TAL-04', 'Espalda Tania L', 1),
('MOD-010', 'TAL-04', 'Manga Larga Tania L', 2),
('MOD-010', 'TAL-01', 'Delantero Tania St', 2),
('MOD-010', 'TAL-01', 'Espalda Tania St', 1),
('MOD-010', 'TAL-01', 'Manga Larga Tania St', 2);

COMMIT;