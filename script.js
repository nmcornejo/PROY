// --- DOM Elements ---
// Authentication Section
const authSection = document.getElementById('authSection');
const loginFormContainer = document.getElementById('loginFormContainer');
const registerUserFormContainer = document.getElementById('registerUserFormContainer');
const forgotPasswordRequestFormContainer = document.getElementById('forgotPasswordRequestFormContainer'); // Nuevo
const updatePasswordFormContainer = document.getElementById('updatePasswordFormContainer'); // Nuevo

const loginForm = document.getElementById('loginForm');
const registerUserForm = document.getElementById('registerUserForm');
const forgotPasswordRequestForm = document.getElementById('forgotPasswordRequestForm'); // Nuevo
const updatePasswordForm = document.getElementById('updatePasswordForm'); // Nuevo

const showRegisterLink = document.getElementById('showRegisterLink');
const showLoginLink = document.getElementById('showLoginLink');
const forgotPasswordLink = document.getElementById('forgotPasswordLink'); // Nuevo
const backToLoginFromForgotLink = document.getElementById('backToLoginFromForgotLink'); // Nuevo
const backToLoginFromUpdateLink = document.getElementById('backToLoginFromUpdateLink'); // Nuevo

// Navigation Links
const navLinkRegistroPaciente = document.getElementById('navLinkRegistroPaciente');
const navLinkLogin = document.getElementById('navLinkLogin');
const navLinkRegistroUsuario = document.getElementById('navLinkRegistroUsuario');
const navItemLogout = document.getElementById('navItemLogout');
const navLinkLogout = document.getElementById('navLinkLogout');
const navItemUser = document.getElementById('navItemUser');
const currentUserDisplay = document.getElementById('currentUserDisplay');

// Patient Management Section (initially hidden)
const patientManagementSection = document.getElementById('patientManagementSection');

// Form Validation Elements (for user registration and password update)
const registerPassword = document.getElementById('registerPassword');
const confirmPassword = document.getElementById('confirmPassword');
const passwordFeedback = document.getElementById('passwordFeedback');

const newPassword = document.getElementById('newPassword'); // Nuevo
const confirmNewPassword = document.getElementById('confirmNewPassword'); // Nuevo
const newPasswordFeedback = document.getElementById('newPasswordFeedback'); // Nuevo
const confirmNewPasswordFeedback = document.getElementById('confirmNewPasswordFeedback'); // Nuevo

// --- Global Variables ---
let users = JSON.parse(localStorage.getItem('users')) || []; // Load users from localStorage
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null; // Load current user from localStorage
let userToResetPassword = null; // Variable para guardar el usuario al que se le va a resetear la contraseña

// --- Utility Functions ---

/**
 * Muestra una alerta temporal en la parte superior de la pantalla.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} type - El tipo de alerta (e.g., 'success', 'danger', 'warning', 'info').
 */
function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    const alertId = `alert-${Date.now()}`; // Unique ID for each alert

    const alertHtml = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show text-center" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    alertContainer.insertAdjacentHTML('beforeend', alertHtml);

    // Auto-dismiss the alert after 5 seconds
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            const bsAlert = new bootstrap.Alert(alertElement); // Bootstrap's JS for dismissing
            bsAlert.close();
        }
    }, 5000);
}

/**
 * Valida la complejidad de la contraseña.
 * Mín. 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial.
 * @param {string} password - La contraseña a validar.
 * @param {HTMLElement} feedbackElement - El elemento donde mostrar el feedback.
 * @returns {boolean} - True si la contraseña es válida, false en caso contrario.
 */
function validatePassword(password, feedbackElement) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);

    if (password.length < minLength) {
        feedbackElement.textContent = `La contraseña debe tener al menos ${minLength} caracteres.`;
        return false;
    }
    if (!hasUpperCase) {
        feedbackElement.textContent = 'La contraseña debe contener al menos una letra mayúscula.';
        return false;
    }
    if (!hasLowerCase) {
        feedbackElement.textContent = 'La contraseña debe contener al menos una letra minúscula.';
        return false;
    }
    if (!hasNumber) {
        feedbackElement.textContent = 'La contraseña debe contener al menos un número.';
        return false;
    }
    if (!hasSpecialChar) {
        feedbackElement.textContent = 'La contraseña debe contener al menos un carácter especial (!@#$%^&*...).';
        return false;
    }
    return true;
}

/**
 * Actualiza la visibilidad de las secciones y la barra de navegación según el estado de la sesión.
 */
function updateUI() {
    if (currentUser) {
        authSection.classList.add('d-none'); // Hide auth section
        patientManagementSection.classList.remove('d-none'); // Show patient section

        navLinkLogin.classList.add('d-none'); // Hide login link
        navLinkRegistroUsuario.classList.add('d-none'); // Hide register user link
        navItemLogout.classList.remove('d-none'); // Show logout button
        navItemUser.classList.remove('d-none'); // Show current user display
        currentUserDisplay.textContent = `Bienvenido, ${currentUser.username} (${currentUser.role === 'medico' ? 'Médico' : 'Ventanilla'})`;

        // Specific UI adjustments based on role
        if (currentUser.role === 'ventanilla') {
            // Patient registration and table are visible by default for both roles
            // No specific elements to hide/show yet for Ventanilla
            // In future, disable 'Edit' or 'Historial' for Ventanilla if needed
        } else if (currentUser.role === 'medico') {
            // Medical specific features will be enabled in later stages (e.g., add new attention)
            // For now, both roles see the patient list
        }
    } else {
        authSection.classList.remove('d-none'); // Show auth section
        patientManagementSection.classList.add('d-none'); // Hide patient section

        // Ensure only login form is visible by default when logged out
        loginFormContainer.classList.remove('d-none');
        registerUserFormContainer.classList.add('d-none');
        forgotPasswordRequestFormContainer.classList.add('d-none');
        updatePasswordFormContainer.classList.add('d-none');

        navLinkLogin.classList.remove('d-none'); // Show login link
        navLinkRegistroUsuario.classList.remove('d-none'); // Show register user link
        navItemLogout.classList.add('d-none'); // Hide logout button
        navItemUser.classList.add('d-none'); // Hide current user display
    }
}

// --- Event Listeners for Authentication ---

// Toggle between Login and Register User Forms
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.classList.add('d-none');
    forgotPasswordRequestFormContainer.classList.add('d-none'); // Hide forgot password form
    updatePasswordFormContainer.classList.add('d-none'); // Hide update password form
    registerUserFormContainer.classList.remove('d-none');
    registerUserForm.reset(); // Clear form on toggle
    registerPassword.classList.remove('is-invalid'); // Clear validation feedback
    confirmPassword.classList.remove('is-invalid');
    passwordFeedback.textContent = '';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerUserFormContainer.classList.add('d-none');
    forgotPasswordRequestFormContainer.classList.add('d-none'); // Hide forgot password form
    updatePasswordFormContainer.classList.add('d-none'); // Hide update password form
    loginFormContainer.classList.remove('d-none');
    loginForm.reset(); // Clear form on toggle
});

// Show Forgot Password Form
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.classList.add('d-none');
    registerUserFormContainer.classList.add('d-none');
    updatePasswordFormContainer.classList.add('d-none');
    forgotPasswordRequestFormContainer.classList.remove('d-none');
    forgotPasswordRequestForm.reset(); // Clear form
    document.getElementById('resetUsernameOrEmail').classList.remove('is-invalid'); // Clear validation
});

// Back to Login from Forgot Password Form
backToLoginFromForgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordRequestFormContainer.classList.add('d-none');
    loginFormContainer.classList.remove('d-none');
    loginForm.reset(); // Clear login form
});

// Back to Login from Update Password Form
backToLoginFromUpdateLink.addEventListener('click', (e) => {
    e.preventDefault();
    updatePasswordFormContainer.classList.add('d-none');
    loginFormContainer.classList.remove('d-none');
    loginForm.reset(); // Clear login form
});


// User Registration Form Submission
registerUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = registerPassword.value;
    const confirmPass = confirmPassword.value;
    const role = document.getElementById('userRole').value;

    let isValid = true;

    // Validate Username and Email
    if (username === '') {
        document.getElementById('registerUsername').classList.add('is-invalid');
        isValid = false;
    } else {
        document.getElementById('registerUsername').classList.remove('is-invalid');
    }
    if (email === '' || !/\S+@\S+\.\S+/.test(email)) { // Basic email regex
        document.getElementById('registerEmail').classList.add('is-invalid');
        isValid = false;
    } else {
        document.getElementById('registerEmail').classList.remove('is-invalid');
    }

    // Check if username or email already exists
    if (users.some(user => user.username === username)) {
        document.getElementById('registerUsername').classList.add('is-invalid');
        document.getElementById('registerUsername').nextElementSibling.textContent = 'Este nombre de usuario ya existe.';
        isValid = false;
    }
    if (users.some(user => user.email === email)) {
        document.getElementById('registerEmail').classList.add('is-invalid');
        document.getElementById('registerEmail').nextElementSibling.textContent = 'Este correo electrónico ya está registrado.';
        isValid = false;
    }

    // Validate Password Complexity
    if (!validatePassword(password, passwordFeedback)) {
        registerPassword.classList.add('is-invalid');
        isValid = false;
    } else {
        registerPassword.classList.remove('is-invalid');
    }

    // Validate Password Confirmation
    if (password !== confirmPass) {
        confirmPassword.classList.add('is-invalid');
        confirmPassword.nextElementSibling.textContent = 'Las contraseñas no coinciden.';
        isValid = false;
    } else {
        confirmPassword.classList.remove('is-invalid');
    }

    // Validate Role selection
    if (role === '') {
        document.getElementById('userRole').classList.add('is-invalid');
        isValid = false;
    } else {
        document.getElementById('userRole').classList.remove('is-invalid');
    }

    if (isValid) {
        const newUser = { username, email, password, role }; // En una aplicación real, se hashearía la contraseña aquí.
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        showAlert('Usuario registrado exitosamente. Ya puedes iniciar sesión.', 'success');
        registerUserForm.reset(); // Clear form
        showLoginLink.click(); // Switch to login form
    } else {
        showAlert('Por favor, corrige los errores en el formulario de registro.', 'danger');
    }
});

// Login Form Submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const loginUsername = document.getElementById('loginUsername').value.trim();
    const loginPassword = document.getElementById('loginPassword').value;

    const foundUser = users.find(user =>
        (user.username === loginUsername || user.email === loginUsername) && user.password === loginPassword
    );

    if (foundUser) {
        currentUser = foundUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showAlert(`¡Bienvenido, ${currentUser.username}! Has iniciado sesión como ${currentUser.role === 'medico' ? 'Médico' : 'Personal de Ventanilla'}.`, 'success');
        loginForm.reset();
        updateUI(); // Update UI after successful login
    } else {
        showAlert('Nombre de usuario/correo o contraseña incorrectos.', 'danger');
    }
});

// Logout functionality
navLinkLogout.addEventListener('click', (e) => {
    e.preventDefault();
    currentUser = null;
    localStorage.removeItem('currentUser');
    showAlert('Has cerrado sesión exitosamente.', 'info');
    updateUI(); // Update UI after logout
});


// --- Forgot Password Request Form Submission (Client-Side Simulation) ---
forgotPasswordRequestForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const usernameOrEmail = document.getElementById('resetUsernameOrEmail').value.trim();

    if (usernameOrEmail === '') {
        document.getElementById('resetUsernameOrEmail').classList.add('is-invalid');
        showAlert('Por favor, ingresa tu nombre de usuario o correo electrónico.', 'danger');
        return;
    } else {
        document.getElementById('resetUsernameOrEmail').classList.remove('is-invalid');
    }

    // --- SIMULACIÓN CLIENT-SIDE ---
    // En una aplicación real, esta sería una llamada a tu backend.
    // El backend verificaría el usuario, generaría un token y enviaría un correo.

    const userExists = users.find(user => user.username === usernameOrEmail || user.email === usernameOrEmail);

    if (userExists) {
        // En un escenario real, aquí se le enviaría un correo al usuario
        // con un enlace único para restablecer la contraseña.
        // Para esta simulación, pasamos directamente a la pantalla de "establecer nueva contraseña".
        userToResetPassword = userExists; // Guardar el usuario para el siguiente paso
        showAlert('Si el usuario/correo existe, se ha iniciado el proceso de restablecimiento. Por favor, ingresa tu nueva contraseña.', 'success');
        forgotPasswordRequestFormContainer.classList.add('d-none');
        updatePasswordFormContainer.classList.remove('d-none');
        newPassword.value = ''; // Limpiar campos
        confirmNewPassword.value = '';
        newPassword.classList.remove('is-invalid');
        confirmNewPassword.classList.remove('is-invalid');
        newPasswordFeedback.textContent = '';
        confirmNewPasswordFeedback.textContent = '';
    } else {
        showAlert('Si el usuario/correo existe, se ha iniciado el proceso de restablecimiento.', 'info'); // Mensaje genérico por seguridad
    }
});


// --- Update Password Form Submission (Client-Side Simulation) ---
updatePasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newPass = newPassword.value;
    const confirmNewPass = confirmNewPassword.value;

    let isValid = true;

    if (!validatePassword(newPass, newPasswordFeedback)) {
        newPassword.classList.add('is-invalid');
        isValid = false;
    } else {
        newPassword.classList.remove('is-invalid');
    }

    if (newPass !== confirmNewPass) {
        confirmNewPassword.classList.add('is-invalid');
        confirmNewPasswordFeedback.textContent = 'Las contraseñas no coinciden.';
        isValid = false;
    } else {
        confirmNewPassword.classList.remove('is-invalid');
    }

    if (isValid && userToResetPassword) {
        // --- SIMULACIÓN CLIENT-SIDE ---
        // En una aplicación real, esta sería una llamada a tu backend.
        // El backend verificaría el token (si se usó), y luego actualizaría la contraseña hasheada en la BD.

        const userIndex = users.findIndex(user => user.username === userToResetPassword.username || user.email === userToResetPassword.email);
        if (userIndex !== -1) {
            users[userIndex].password = newPass; // En una aplicación real, se guardaría la contraseña hasheada
            localStorage.setItem('users', JSON.stringify(users));
            showAlert('Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.', 'success');
            userToResetPassword = null; // Limpiar el usuario en proceso de reseteo

            // Volver a la pantalla de login después de un breve retraso
            setTimeout(() => {
                updatePasswordFormContainer.classList.add('d-none');
                loginFormContainer.classList.remove('d-none');
                loginForm.reset();
                document.getElementById('loginUsername').value = users[userIndex].username; // O email
            }, 3000);

        } else {
            showAlert('Error al actualizar la contraseña. El usuario no fue encontrado.', 'danger');
        }
    } else if (!userToResetPassword) {
        showAlert('No se ha iniciado un proceso de restablecimiento de contraseña válido.', 'danger');
    } else {
        showAlert('Por favor, corrige los errores en el formulario de nueva contraseña.', 'danger');
    }
});
 

// --- Initial UI Setup ---
document.addEventListener('DOMContentLoaded', updateUI); // Update UI when the page loads

// --- DOM Elements for Patient Management ---
const patientForm = document.getElementById('patientForm');
const patientTableBody = document.getElementById('patientTableBody');
const contadorCritico = document.getElementById('contadorCritico');
const contadorUrgente = document.getElementById('contadorUrgente');
const contadorModerado = document.getElementById('contadorModerado');
const contadorLeve = document.getElementById('contadorLeve');

// --- Global Variables for Patient Data ---
let patients = JSON.parse(localStorage.getItem('patients')) || []; // Load patients from localStorage

// --- Patient Management Functions ---

/**
 * Valida un campo de formulario para asegurarse de que no esté vacío.
 * Aplica/elimina la clase 'is-invalid' de Bootstrap y muestra/oculta el feedback.
 * @param {HTMLElement} element - El elemento del input o select.
 * @returns {boolean} - True si el campo es válido, false en caso contrario.
 */
function validateField(element) {
    if (element.value.trim() === '' || (element.type === 'number' && isNaN(element.value))) {
        element.classList.add('is-invalid');
        return false;
    } else {
        element.classList.remove('is-invalid');
        return true;
    }
}

/**
 * Valida campos específicos del formulario de paciente.
 * @returns {boolean} - True si el formulario es válido, false en caso contrario.
 */
function validatePatientForm() {
    let isValid = true;

    // Validate text fields
    isValid = validateField(document.getElementById('nombreCompleto')) && isValid;
    isValid = validateField(document.getElementById('sintomas')) && isValid;

    // Validate numeric fields (Edad)
    const edadInput = document.getElementById('edad');
    if (!validateField(edadInput) || parseInt(edadInput.value) <= 0 || parseInt(edadInput.value) > 120) {
        edadInput.classList.add('is-invalid');
        edadInput.nextElementSibling.textContent = 'La edad debe ser un número entre 1 y 120.';
        isValid = false;
    } else {
        edadInput.classList.remove('is-invalid');
    }

    // Validate select fields
    isValid = validateField(document.getElementById('genero')) && isValid;
    isValid = validateField(document.getElementById('nivelGravedad')) && isValid;

    // Validate Documento de identidad (min 5, max 15 chars)
    const documentoInput = document.getElementById('documento');
    if (!validateField(documentoInput) || documentoInput.value.trim().length < 5 || documentoInput.value.trim().length > 15) {
        documentoInput.classList.add('is-invalid');
        documentoInput.nextElementSibling.textContent = 'El documento debe tener entre 5 y 15 caracteres.';
        isValid = false;
    } else {
        documentoInput.classList.remove('is-invalid');
    }

    return isValid;
}

/**
 * Renderiza la tabla de pacientes, ordenando por gravedad.
 */
function renderPatientsTable() {
    // Clear existing rows
    patientTableBody.innerHTML = '';

    // Sort patients by gravity (Crítico > Urgente > Moderado > Leve)
    const severityOrder = { 'Critico': 4, 'Urgente': 3, 'Moderado': 2, 'Leve': 1 };
    const sortedPatients = [...patients].sort((a, b) => {
        return severityOrder[b.nivelGravedad] - severityOrder[a.nivelGravedad];
    });

    let countCritico = 0;
    let countUrgente = 0;
    let countModerado = 0;
    let countLeve = 0;

    sortedPatients.forEach(patient => {
        const row = patientTableBody.insertRow();
        let rowClass = '';
        let gravedadTextClass = '';

        switch (patient.nivelGravedad) {
            case 'Critico':
                rowClass = 'table-row-critico';
                gravedadTextClass = 'gravedad-critico';
                countCritico++;
                break;
            case 'Urgente':
                rowClass = 'table-row-urgente';
                gravedadTextClass = 'gravedad-urgente';
                countUrgente++;
                break;
            case 'Moderado':
                rowClass = 'table-row-moderado';
                gravedadTextClass = 'gravedad-moderado';
                countModerado++;
                break;
            case 'Leve':
                rowClass = 'table-row-leve';
                gravedadTextClass = 'gravedad-leve';
                countLeve++;
                break;
        }

        row.classList.add(rowClass);

        row.innerHTML = `
            <td>${patient.nombreCompleto}</td>
            <td>${patient.edad}</td>
            <td>${patient.genero}</td>
            <td>${patient.documento}</td>
            <td class="${gravedadTextClass}">${patient.nivelGravedad}</td>
            <td>${new Date(patient.fechaIngreso).toLocaleString()}</td>
            <td class="text-center">
                <button class="btn btn-sm btn-info btn-ver-historial me-2" data-id="${patient.id}" data-bs-toggle="modal" data-bs-target="#historialModal" ${currentUser && currentUser.role === 'medico' ? '' : 'disabled'}>Ver Historial</button>
                <button class="btn btn-sm btn-danger btn-eliminar" data-id="${patient.id}">Eliminar</button>
            </td>
        `;
    });

    // Update counters
    contadorCritico.textContent = countCritico;
    contadorUrgente.textContent = countUrgente;
    contadorModerado.textContent = countModerado;
    contadorLeve.textContent = countLeve;

    // Add event listeners for delete and view historial buttons
    document.querySelectorAll('.btn-eliminar').forEach(button => {
        button.addEventListener('click', (e) => {
            const patientId = e.target.dataset.id;
            deletePatient(patientId);
        });
    });

    document.querySelectorAll('.btn-ver-historial').forEach(button => {
        button.addEventListener('click', (e) => {
            const patientId = e.target.dataset.id;
            // Only allow medical role to view/add to historial
            if (currentUser && currentUser.role === 'medico') {
                showHistorialModal(patientId);
            } else {
                 showAlert('Solo los usuarios con rol de Médico pueden ver el historial clínico.', 'warning');
            }
        });
    });
}

/**
 * Elimina un paciente de la lista.
 * @param {string} id - El ID único del paciente a eliminar.
 */
function deletePatient(id) {
    // Show a confirmation dialog
    if (confirm('¿Estás seguro de que quieres eliminar a este paciente? Esta acción no se puede deshacer.')) {
        patients = patients.filter(patient => patient.id !== id);
        localStorage.setItem('patients', JSON.stringify(patients));
        showAlert('Paciente eliminado exitosamente.', 'info');
        renderPatientsTable(); // Re-render the table
    }
}

/**
 * Función para actualizar la UI completa, incluyendo la tabla de pacientes,
 * se llama después de login/logout y cada vez que cambian los pacientes.
 */
function updateAllUI() {
    updateUI(); // From previous stage, controls auth/patient sections
    renderPatientsTable(); // Render the patient table
}


// --- Event Listener for Patient Form Submission ---
patientForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!validatePatientForm()) {
        showAlert('Por favor, corrige los errores en el formulario de registro del paciente.', 'danger');
        return; // Stop if validation fails
    }

    const newPatient = {
        id: crypto.randomUUID(), // Genera un ID único para cada paciente
        nombreCompleto: document.getElementById('nombreCompleto').value.trim(),
        edad: parseInt(document.getElementById('edad').value),
        genero: document.getElementById('genero').value,
        documento: document.getElementById('documento').value.trim(),
        sintomas: document.getElementById('sintomas').value.trim(),
        nivelGravedad: document.getElementById('nivelGravedad').value,
        tratamiento: document.getElementById('tratamiento').value.trim(),
        medicamentos: document.getElementById('medicamentos').value.trim(),
        // Get selected options from multi-select
        examenes: Array.from(document.getElementById('examenes').selectedOptions).map(option => option.value),
        fechaIngreso: new Date().toISOString(), // ISO string for easy storage and parsing
        historialClinico: [] // Initialize empty array for clinical history
    };

    patients.push(newPatient);
    localStorage.setItem('patients', JSON.stringify(patients)); // Save to localStorage

    showAlert('Paciente registrado exitosamente.', 'success');
    patientForm.reset(); // Clear the form
    renderPatientsTable(); // Re-render the table with the new patient

    // Show critical alert if severity is Critical
    if (newPatient.nivelGravedad === 'Critico') {
        showAlert(`¡Alerta! Paciente ${newPatient.nombreCompleto} registrado en estado CRÍTICO.`, 'danger');
        // You could add a sound effect here for critical alerts if desired
        // const audio = new Audio('path/to/alert.mp3');
        // audio.play();
    }
});


// --- Initial Render on Load (ensure it's called after currentUser is set) ---
// Modifica la línea existente de DOMContentLoaded para usar updateAllUI
document.addEventListener('DOMContentLoaded', updateAllUI);

// --- DOM Elements for Historial Clínico Modal ---
const historialModal = new bootstrap.Modal(document.getElementById('historialModal'));
const historialPacienteNombre = document.getElementById('historialPacienteNombre');
const historialPacienteDocumento = document.getElementById('historialPacienteDocumento');
const historialPacienteEdad = document.getElementById('historialPacienteEdad');
const historialAtenciones = document.getElementById('historialAtenciones');
const noHistorialMessage = document.getElementById('noHistorialMessage');
const nuevaAtencionFormContainer = document.getElementById('nuevaAtencionFormContainer');
const nuevaAtencionForm = document.getElementById('nuevaAtencionForm');

// Inputs for New Attention Form
const atencionSintomas = document.getElementById('atencionSintomas');
const atencionNivelGravedad = document.getElementById('atencionNivelGravedad');
const atencionDiagnostico = document.getElementById('atencionDiagnostico');
const atencionTratamiento = document.getElementById('atencionTratamiento');
const atencionMedicamentos = document.getElementById('atencionMedicamentos');
const atencionExamenes = document.getElementById('atencionExamenes');
const atencionObservaciones = document.getElementById('atencionObservaciones');

// --- Global Variable for current patient being viewed in historial ---
let currentPatientInHistorial = null;

// --- Historial Clínico Functions ---

/**
 * Muestra el modal del historial clínico con los datos del paciente seleccionado.
 * @param {string} patientId - El ID del paciente cuyo historial se va a mostrar.
 */
function showHistorialModal(patientId) {
    currentPatientInHistorial = patients.find(p => p.id === patientId);

    if (!currentPatientInHistorial) {
        showAlert('Error: Paciente no encontrado para mostrar el historial.', 'danger');
        return;
    }

    historialPacienteNombre.textContent = currentPatientInHistorial.nombreCompleto;
    historialPacienteDocumento.textContent = currentPatientInHistorial.documento;
    historialPacienteEdad.textContent = currentPatientInHistorial.edad;

    renderHistorialAtenciones(currentPatientInHistorial.historialClinico);

    // Show/hide new attention form based on user role
    if (currentUser && currentUser.role === 'medico') {
        nuevaAtencionFormContainer.classList.remove('d-none');
    } else {
        nuevaAtencionFormContainer.classList.add('d-none');
    }

    historialModal.show(); // Show the Bootstrap modal
}

/**
 * Renderiza las atenciones dentro del historial clínico del modal.
 * @param {Array} atenciones - El array de atenciones del paciente.
 */
function renderHistorialAtenciones(atenciones) {
    historialAtenciones.innerHTML = ''; // Clear previous content

    if (atenciones.length === 0) {
        noHistorialMessage.classList.remove('d-none');
        return;
    } else {
        noHistorialMessage.classList.add('d-none');
    }

    // Sort attentions by date, newest first
    const sortedAtenciones = [...atenciones].sort((a, b) => new Date(b.fechaAtencion) - new Date(a.fechaAtencion));

    sortedAtenciones.forEach((atencion, index) => {
        const atencionCard = document.createElement('div');
        atencionCard.classList.add('card', 'mb-3', 'shadow-sm');

        // Apply background color based on severity for each attention entry
        let cardBgClass = '';
        switch (atencion.nivelGravedad) {
            case 'Critico':
                cardBgClass = 'table-row-critico'; // Using the same classes as table rows
                break;
            case 'Urgente':
                cardBgClass = 'table-row-urgente';
                break;
            case 'Moderado':
                cardBgClass = 'table-row-moderado';
                break;
            case 'Leve':
                cardBgClass = 'table-row-leve';
                break;
        }
        atencionCard.classList.add(cardBgClass);


        atencionCard.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center" style="background-color: rgba(255,255,255,0.7);">
                <h5 class="mb-0">Atención #${sortedAtenciones.length - index} - ${new Date(atencion.fechaAtencion).toLocaleString()}</h5>
                <span class="badge ${getSeverityBadgeClass(atencion.nivelGravedad)}">${atencion.nivelGravedad}</span>
            </div>
            <div class="card-body">
                <p><strong>Médico:</strong> ${atencion.medicoAtendente || 'N/A'}</p>
                <p><strong>Síntomas:</strong> ${atencion.sintomas || 'No especificados'}</p>
                ${atencion.diagnostico ? `<p><strong>Diagnóstico:</strong> ${atencion.diagnostico}</p>` : ''}
                <p><strong>Tratamiento:</strong> ${atencion.tratamiento || 'No especificado'}</p>
                <p><strong>Medicamentos:</strong> ${atencion.medicamentos || 'No especificados'}</p>
                <p><strong>Exámenes:</strong> ${atencion.examenes && atencion.examenes.length > 0 ? atencion.examenes.join(', ') : 'No solicitados'}</p>
                ${atencion.observaciones ? `<p><strong>Observaciones:</strong> ${atencion.observaciones}</p>` : ''}
            </div>
        `;
        historialAtenciones.appendChild(atencionCard);
    });
}

/**
 * Helper function to get Bootstrap badge class for severity.
 * @param {string} severity - The severity level.
 * @returns {string} - Bootstrap badge class.
 */
function getSeverityBadgeClass(severity) {
    switch (severity) {
        case 'Critico': return 'bg-danger';
        case 'Urgente': return 'bg-warning text-dark';
        case 'Moderado': return 'bg-info text-dark';
        case 'Leve': return 'bg-success';
        default: return 'bg-secondary';
    }
}

/**
 * Valida el formulario de nueva atención.
 * @returns {boolean} - True si es válido, false en caso contrario.
 */
function validateNuevaAtencionForm() {
    let isValid = true;
    isValid = validateField(atencionSintomas) && isValid;
    isValid = validateField(atencionNivelGravedad) && isValid;
    return isValid;
}

// --- Event Listener for New Attention Form Submission ---
nuevaAtencionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateNuevaAtencionForm()) {
        showAlert('Por favor, completa los campos obligatorios para la nueva atención (Síntomas, Nivel de Gravedad).', 'danger');
        return;
    }

    if (!currentPatientInHistorial) {
        showAlert('Error: No se ha seleccionado un paciente para la nueva atención.', 'danger');
        return;
    }

    const newAtencion = {
        fechaAtencion: new Date().toISOString(),
        medicoAtendente: currentUser ? currentUser.username : 'Desconocido', // Get current logged in user
        sintomas: atencionSintomas.value.trim(),
        nivelGravedad: atencionNivelGravedad.value,
        diagnostico: atencionDiagnostico.value.trim(),
        tratamiento: atencionTratamiento.value.trim(),
        medicamentos: atencionMedicamentos.value.trim(),
        examenes: Array.from(atencionExamenes.selectedOptions).map(option => option.value),
        observaciones: atencionObservaciones.value.trim()
    };

    // Add new attention to the patient's historial
    currentPatientInHistorial.historialClinico.push(newAtencion);

    // Find the patient in the main 'patients' array and update it
    const patientIndex = patients.findIndex(p => p.id === currentPatientInHistorial.id);
    if (patientIndex !== -1) {
        patients[patientIndex] = currentPatientInHistorial; // Update the patient object
        localStorage.setItem('patients', JSON.stringify(patients)); // Save updated patients array to localStorage
        showAlert('Nueva atención registrada exitosamente en el historial.', 'success');
        
        nuevaAtencionForm.reset(); // Clear the form
        renderHistorialAtenciones(currentPatientInHistorial.historialClinico); // Re-render historial in modal
        renderPatientsTable(); // Re-render main patient table (in case severity changed)
    } else {
        showAlert('Error al guardar la atención: paciente no encontrado en la lista principal.', 'danger');
    }
});

// --- Initial Setup (Make sure this is at the end of your script to be called after all functions are defined) ---
// The updateAllUI() call should already be present from the previous stage
// document.addEventListener('DOMContentLoaded', updateAllUI); // Make sure this is uncommented and only called once



