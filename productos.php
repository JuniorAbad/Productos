<?php
// Conexión a la base de datos
$db = new PDO('pgsql:host=localhost;dbname=gestion_productos', 'postgres', '123456');

// Verificación de solicitudes AJAX
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    switch ($action) {
        case 'guardar_producto':
            guardarProducto($db);
            break;
        case 'cargar_bodegas':
            cargarBodegas($db);
            break;
        case 'cargar_sucursales':
            cargarSucursales($db);
            break;
        case 'cargar_monedas':
            cargarMonedas($db);
            break;
    }
}

function guardarProducto($db)
{
    $codigo = $_POST['codigo'] ?? '';
    $nombre = $_POST['nombre'] ?? '';
    $bodega_id = $_POST['bodega'] ?? '';
    $sucursal_id = $_POST['sucursal'] ?? '';
    $moneda_id = $_POST['moneda'] ?? '';
    $precio = $_POST['precio'] ?? '';
    $materiales = $_POST['materiales'] ?? [];
    $descripcion = $_POST['descripcion'] ?? '';

    // Validaciones
    if (!preg_match('/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,15}$/', $codigo)) {
        echo json_encode(['error' => 'El código del producto no es válido.']);
        exit;
    }

    if (strlen($nombre) < 2 || strlen($nombre) > 50) {
        echo json_encode(['error' => 'El nombre del producto debe tener entre 2 y 50 caracteres.']);
        exit;
    }

    if (!is_numeric($precio) || $precio <= 0 || !preg_match('/^\d+(\.\d{1,2})?$/', $precio)) {
        echo json_encode(['error' => 'El precio no es válido.']);
        exit;
    }

    if (count($materiales) < 2) {
        echo json_encode(['error' => 'Debe seleccionar al menos dos materiales.']);
        exit;
    }

    if (strlen($descripcion) < 10 || strlen($descripcion) > 1000) {
        echo json_encode(['error' => 'La descripción debe tener entre 10 y 1000 caracteres.']);
        exit;
    }

    // Verificar unicidad del código del producto
    $stmt = $db->prepare("SELECT COUNT(*) FROM productos WHERE codigo = :codigo");
    $stmt->execute([':codigo' => $codigo]);
    if ($stmt->fetchColumn() > 0) {
        echo json_encode(['error' => 'El código del producto ya está registrado.']);
        exit;
    }

    // Insertar en la base de datos
    $stmt = $db->prepare("INSERT INTO productos (codigo, nombre, bodega_id, sucursal_id, moneda_id, precio, materiales, descripcion) VALUES (:codigo, :nombre, :bodega_id, :sucursal_id, :moneda_id, :precio, :materiales, :descripcion)");
    $stmt->execute([
        ':codigo' => $codigo,
        ':nombre' => $nombre,
        ':bodega_id' => $bodega_id,
        ':sucursal_id' => $sucursal_id,
        ':moneda_id' => $moneda_id,
        ':precio' => $precio,
        ':materiales' => '{' . implode(',', $materiales) . '}',
        ':descripcion' => $descripcion
    ]);

    echo json_encode(['success' => true]);
}

function cargarBodegas($db)
{
    $stmt = $db->query("SELECT id, nombre FROM bodegas");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function cargarSucursales($db)
{
    $bodega_id = $_POST['bodega_id'] ?? '';
    $stmt = $db->prepare("SELECT id, nombre FROM sucursales WHERE bodega_id = :bodega_id");
    $stmt->execute([':bodega_id' => $bodega_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function cargarMonedas($db)
{
    $stmt = $db->query("SELECT id, nombre FROM monedas");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
?>
