document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("productForm");
    const guardarBtn = document.getElementById("guardarBtn");
    const bodegaSelect = document.getElementById("bodega");
    const sucursalSelect = document.getElementById("sucursal");
    const monedaSelect = document.getElementById("moneda");

    // Cargar opciones dinámicas al inicio
    cargarBodegas();
    cargarMonedas();

    // Manejar el evento del botón Guardar
    guardarBtn.addEventListener("click", function () {
        if (validarFormulario()) {
            guardarProducto();
        }
    });

    // Validaciones del formulario
    function validarFormulario() {
        const codigo = document.getElementById("codigo").value;
        const nombre = document.getElementById("nombre").value;
        const precio = document.getElementById("precio").value;
        const materiales = Array.from(document.querySelectorAll(".materiales input:checked"));
        const descripcion = document.getElementById("descripcion").value;

        if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,15}$/.test(codigo)) {
            alert("El código debe tener entre 5 y 15 caracteres con letras y números.");
            return false;
        }

        if (nombre.length < 2 || nombre.length > 50) {
            alert("El nombre debe tener entre 2 y 50 caracteres.");
            return false;
        }

        if (!/^\d+(\.\d{1,2})?$/.test(precio)) {
            alert("El precio debe ser un número positivo con hasta dos decimales.");
            return false;
        }

        if (materiales.length < 2) {
            alert("Debe seleccionar al menos dos materiales.");
            return false;
        }

        if (descripcion.length < 10 || descripcion.length > 1000) {
            alert("La descripción debe tener entre 10 y 1000 caracteres.");
            return false;
        }

        return true;
    }

    // Cargar bodegas dinámicamente
    function cargarBodegas() {
        fetch("productos.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "action=cargar_bodegas"
        })
        .then(response => response.json())
        .then(data => {
            data.forEach(bodega => {
                const option = document.createElement("option");
                option.value = bodega.id;
                option.textContent = bodega.nombre;
                bodegaSelect.appendChild(option);
            });

            // Cargar las sucursales cuando se seleccione una bodega
            bodegaSelect.addEventListener('change', function () {
                const bodega_id = this.value;
                cargarSucursales(bodega_id);
            });
        });
    }

    // Cargar monedas dinámicamente
    function cargarMonedas() {
        fetch("productos.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "action=cargar_monedas"
        })
        .then(response => response.json())
        .then(data => {
            data.forEach(moneda => {
                const option = document.createElement("option");
                option.value = moneda.id;
                option.textContent = moneda.nombre;
                monedaSelect.appendChild(option);
            });
        });
    }

    // Cargar sucursales de la bodega seleccionada
    function cargarSucursales(bodega_id) {
        fetch("productos.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "action=cargar_sucursales&bodega_id=" + bodega_id
        })
        .then(response => response.json())
        .then(data => {
            // Limpiar el select de sucursales antes de agregar nuevas opciones
            sucursalSelect.innerHTML = '<option value=""></option>';

            data.forEach(sucursal => {
                const option = document.createElement("option");
                option.value = sucursal.id;
                option.textContent = sucursal.nombre;
                sucursalSelect.appendChild(option);
            });
        });
    }

    // Guardar producto
    function guardarProducto() {
        const formData = new FormData(form);
        formData.append('action', 'guardar_producto'); // Añadir la acción para guardar
        
        fetch("productos.php", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert("Producto registrado exitosamente.");
                form.reset();
            }
        })
        .catch(error => {
            console.error('Error al guardar el producto:', error);
        });
    }
});
