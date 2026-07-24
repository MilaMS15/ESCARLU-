-- CÓDIGO DE RESPALDO PARA SUPABASE (YA FUE EJECUTADO)
-- Puedes usar este script en el SQL Editor de Supabase si necesitas restablecer los datos en el futuro.

-- 1. Insertar nuevos modelos
INSERT INTO public.modelos (id_modelo, tipo, nombre, tela, activo) VALUES
('MOD-020', 'Polo', 'Corazon MC', 'Jersey', true),
('MOD-021', 'Polo', 'Corazon ML', 'Jersey', true)
ON CONFLICT (id_modelo) DO UPDATE 
SET tipo = EXCLUDED.tipo, nombre = EXCLUDED.nombre, tela = EXCLUDED.tela, activo = EXCLUDED.activo;

-- 2. Limpiar tabla de moldes antigua
TRUNCATE TABLE public.moldes;

-- 3. Insertar los 84 moldes reales con sus URLs correspondientes
INSERT INTO public.moldes (tipo, modelo, talla, nombre_pieza, dxf_url, rotacion_maxima) VALUES
-- Camisero MC (MOD-001)
('polo', 'MOD-001', 'St', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Camisero%20St.dxf', 360),
('polo', 'MOD-001', 'St', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Camisero%20St.dxf', 360),
('polo', 'MOD-001', 'St', 'Manga Corta', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20St.dxf', 90),
('polo', 'MOD-001', 'L', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Camisero%20L.dxf', 360),
('polo', 'MOD-001', 'L', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Camisero%20L.dxf', 360),
('polo', 'MOD-001', 'L', 'Manga Corta', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20L.dxf', 90),

-- Camisero ML (MOD-002)
('polo', 'MOD-002', 'St', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Camisero%20St.dxf', 360),
('polo', 'MOD-002', 'St', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Camisero%20St.dxf', 360),
('polo', 'MOD-002', 'St', 'Manga Larga', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20St.dxf', 90),
('polo', 'MOD-002', 'L', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Camisero%20L.dxf', 360),
('polo', 'MOD-002', 'L', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Camisero%20L.dxf', 360),
('polo', 'MOD-002', 'L', 'Manga Larga', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20L.dxf', 90),

-- Corazon MC (MOD-020)
('polo', 'MOD-020', 'St', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Corazon%20St.dxf', 360),
('polo', 'MOD-020', 'St', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Corazon%20St.dxf', 360),
('polo', 'MOD-020', 'St', 'Manga Corta', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20St.dxf', 90),
('polo', 'MOD-020', 'L', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Corazon%20L.dxf', 360),
('polo', 'MOD-020', 'L', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Corazon%20L.dxf', 360),
('polo', 'MOD-020', 'L', 'Manga Corta', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20L.dxf', 90),

-- Corazon ML (MOD-021)
('polo', 'MOD-021', 'St', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Corazon%20St.dxf', 360),
('polo', 'MOD-021', 'St', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Corazon%20St.dxf', 360),
('polo', 'MOD-021', 'St', 'Manga Larga', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20St.dxf', 90),
('polo', 'MOD-021', 'L', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Corazon%20L.dxf', 360),
('polo', 'MOD-021', 'L', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Corazon%20L.dxf', 360),
('polo', 'MOD-021', 'L', 'Manga Larga', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20L.dxf', 90),

-- Cuadrado MC (MOD-007)
('polo', 'MOD-007', 'St', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Cuadrado%20St.dxf', 360),
('polo', 'MOD-007', 'St', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Cuadrado%20St.dxf', 360),
('polo', 'MOD-007', 'St', 'Manga Corta', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20St.dxf', 90),
('polo', 'MOD-007', 'L', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Cuadrado%20L.dxf', 360),
('polo', 'MOD-007', 'L', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Cuadrado%20L.dxf', 360),
('polo', 'MOD-007', 'L', 'Manga Corta', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20L.dxf', 90),

-- Cuadrado ML (MOD-008)
('polo', 'MOD-008', 'St', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Cuadrado%20St.dxf', 360),
('polo', 'MOD-008', 'St', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Cuadrado%20St.dxf', 360),
('polo', 'MOD-008', 'St', 'Manga Larga', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20St.dxf', 90),
('polo', 'MOD-008', 'L', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Cuadrado%20L.dxf', 360),
('polo', 'MOD-008', 'L', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Cuadrado%20L.dxf', 360),
('polo', 'MOD-008', 'L', 'Manga Larga', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20L.dxf', 90),

-- Girasol MC (MOD-003)
('polo', 'MOD-003', 'St', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Girasol%20St.dxf', 360),
('polo', 'MOD-003', 'St', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Girasol%20St.dxf', 360),
('polo', 'MOD-003', 'St', 'Manga Corta', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20St.dxf', 90),
('polo', 'MOD-003', 'L', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Girasol%20L.dxf', 360),
('polo', 'MOD-003', 'L', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Girasol%20L.dxf', 360),
('polo', 'MOD-003', 'L', 'Manga Corta', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20L.dxf', 90),

-- Girasol ML (MOD-004)
('polo', 'MOD-004', 'St', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Girasol%20St.dxf', 360),
('polo', 'MOD-004', 'St', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Girasol%20St.dxf', 360),
('polo', 'MOD-004', 'St', 'Manga Larga', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20St.dxf', 90),
('polo', 'MOD-004', 'L', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Girasol%20L.dxf', 360),
('polo', 'MOD-004', 'L', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Girasol%20L.dxf', 360),
('polo', 'MOD-004', 'L', 'Manga Larga', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20L.dxf', 90),

-- Noemi MC (MOD-011)
('polo', 'MOD-011', 'St', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Noemi%20St.dxf', 360),
('polo', 'MOD-011', 'St', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Noemi%20St.dxf', 360),
('polo', 'MOD-011', 'St', 'Manga Corta', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20St.dxf', 90),
('polo', 'MOD-011', 'L', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Noemi%20L.dxf', 360),
('polo', 'MOD-011', 'L', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Noemi%20L.dxf', 360),
('polo', 'MOD-011', 'L', 'Manga Corta', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20L.dxf', 90),

-- Noemi ML (MOD-012)
('polo', 'MOD-012', 'St', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Noemi%20St.dxf', 360),
('polo', 'MOD-012', 'St', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Noemi%20St.dxf', 360),
('polo', 'MOD-012', 'St', 'Manga Larga', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20St.dxf', 90),
('polo', 'MOD-012', 'L', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Noemi%20L.dxf', 360),
('polo', 'MOD-012', 'L', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Noemi%20L.dxf', 360),
('polo', 'MOD-012', 'L', 'Manga Larga', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20L.dxf', 90),

-- Redondo MC (MOD-005)
('polo', 'MOD-005', 'St', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Redondo%20MC%20St.dxf', 360),
('polo', 'MOD-005', 'St', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Redondo%20St.dxf', 360),
('polo', 'MOD-005', 'St', 'Manga Corta', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20St.dxf', 90),
('polo', 'MOD-005', 'L', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Redondo%20MC%20L.dxf', 360),
('polo', 'MOD-005', 'L', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Redondo%20L.dxf', 360),
('polo', 'MOD-005', 'L', 'Manga Corta', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20L.dxf', 90),

-- Redondo ML (MOD-006)
('polo', 'MOD-006', 'St', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Redondo%20ML%20St.dxf', 360),
('polo', 'MOD-006', 'St', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Redondo%20St.dxf', 360),
('polo', 'MOD-006', 'St', 'Manga Larga', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20St.dxf', 90),
('polo', 'MOD-006', 'L', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Redondo%20ML%20L.dxf', 360),
('polo', 'MOD-006', 'L', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Redondo%20L.dxf', 360),
('polo', 'MOD-006', 'L', 'Manga Larga', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20L.dxf', 90),

-- Tania MC (MOD-009)
('polo', 'MOD-009', 'St', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Tania%20St.dxf', 360),
('polo', 'MOD-009', 'St', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Tania%20St.dxf', 360),
('polo', 'MOD-009', 'St', 'Manga Corta', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20Tania%20St.dxf', 90),
('polo', 'MOD-009', 'L', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Tania%20L.dxf', 360),
('polo', 'MOD-009', 'L', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Tania%20L.dxf', 360),
('polo', 'MOD-009', 'L', 'Manga Corta', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Corta%20Tania%20L.dxf', 90),

-- Tania ML (MOD-010)
('polo', 'MOD-010', 'St', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Tania%20St.dxf', 360),
('polo', 'MOD-010', 'St', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Tania%20St.dxf', 360),
('polo', 'MOD-010', 'St', 'Manga Larga', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20Tania%20St.dxf', 90),
('polo', 'MOD-010', 'L', 'Delantero', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Delantero%20Tania%20L.dxf', 360),
('polo', 'MOD-010', 'L', 'Espalda', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Espalda%20Tania%20L.dxf', 360),
('polo', 'MOD-010', 'L', 'Manga Larga', 'https://pbqplcasneqkhwywqnf.supabase.co/storage/v1/object/public/moldes-dxf/Manga%20Larga%20Tania%20L.dxf', 90);
