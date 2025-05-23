import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Coffee, UserPlus, Calendar, Phone, MapPin } from 'lucide-react';
import { Navbar } from '../../shared/navigation/Navbar';
import { Footer } from '../../shared/navigation/Footer';
import { BackButton } from '../../shared/ui/BackButton';
import AuthContext from '../../../contexts/AuthContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { registerAndLogin, verifyEmailCode } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    birthday: '',
    verificationCode: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Formateo especial para el número de teléfono
    if (name === 'phoneNumber') {
      // Eliminar cualquier carácter que no sea dígito
      const numbersOnly = value.replace(/\D/g, '');
      
      // Limitar a 8 dígitos (sin contar el guion)
      const truncated = numbersOnly.slice(0, 8);
      
      // Formatear con guion después de los primeros 4 dígitos
      let formattedNumber = truncated;
      if (truncated.length > 4) {
        formattedNumber = `${truncated.slice(0, 4)}-${truncated.slice(4)}`;
      }
      
      setFormData({ ...formData, [name]: formattedNumber });
    } else if (name === 'verificationCode') {
      // Formateo especial para el código de verificación (alfanumérico, máximo 6)
      // Permitir letras y números (código generado en formato hexadecimal)
      const alphanumeric = value.replace(/[^a-zA-Z0-9]/g, ''); // Mantener solo letras y números
      const truncated = alphanumeric.slice(0, 6);
      setFormData({ ...formData, [name]: truncated });
    } else {
      // Para los demás campos, comportamiento normal
      setFormData({ ...formData, [name]: value });
    }
    
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    // Validar email
    if (!formData.email) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    // Validar teléfono
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'El número de teléfono es obligatorio';
    } else {
      // Verificar que sea un número con formato XXXX-XXXX (8 dígitos con guion en medio)
      const phoneDigits = formData.phoneNumber.replace(/\D/g, '');
      if (phoneDigits.length !== 8) {
        newErrors.phoneNumber = 'El número debe tener 8 dígitos';
      } else if (!/^\d{4}-\d{4}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Formato inválido. Debe ser XXXX-XXXX';
      }
    }
    
    // Validar dirección
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    }
    
    // Validar fecha de nacimiento
    if (!formData.birthday) {
      newErrors.birthday = 'La fecha de nacimiento es obligatoria';
    } else {
      const today = new Date();
      const birthDate = new Date(formData.birthday);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        newErrors.birthday = 'Debes ser mayor de edad';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    // Validar código de verificación
    if (!formData.verificationCode) {
      newErrors.verificationCode = 'El código de verificación es obligatorio';
    } else if (formData.verificationCode.length !== 6) {
      newErrors.verificationCode = 'El código debe tener 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      window.scrollTo(0, 0);
    } else if (currentStep === 2) {
      // Avanzar al paso 3 sin validación (la validación se hace en handleSubmit)
      setCurrentStep(3);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep === 1) {
      if (!validateStep1()) return;
      // Limpiar errores al avanzar al siguiente paso
      setErrors({});
      nextStep();
      return;
    }
    
    if (currentStep === 2) {
      // Ejecutar la validación del paso 2
      if (!validateStep2()) return;
      
      // Si llegamos aquí es porque la validación fue exitosa
      setIsLoading(true);
      setRegisterError('');
      setErrors({}); // Limpiar errores
      
      try {
        // Preparar los datos para enviar al backend
        const userData = {
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          password: formData.password,
          address: formData.address,
          birthday: formData.birthday,
          isVerified: false, // Importante: campo requerido por el backend
        };
        
        // Registrar el usuario sin iniciar sesión automáticamente
        const response = await registerAndLogin(userData);
        
        console.log('Registro exitoso, se requiere verificación:', response);
        
        // Avanzar explícitamente al paso 3 (verificación por código)
        setCurrentStep(3);
        window.scrollTo(0, 0);
      } catch (error) {
        console.error('Error de registro:', error);
        const errorMessage = error.message || 'Hubo un problema al crear tu cuenta. Por favor, inténtalo de nuevo.';
        setRegisterError(errorMessage);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    if (currentStep === 3) {
      if (!validateStep3()) return;
      
      setIsLoading(true);
      setRegisterError('');
      
      try {
        // Verificar el código de email
        const verificationResponse = await verifyEmailCode(formData.verificationCode);
        
        console.log('Verificación exitosa:', verificationResponse);
        
        // Redirigir a la página principal
        navigate('/', { 
          state: { 
            email: formData.email,
            message: '¡Tu cuenta ha sido verificada con éxito! Ahora puedes acceder a todos los servicios.'
          } 
        });
      } catch (error) {
        console.error('Error de verificación:', error);
        const errorMessage = error.message || 'El código de verificación es inválido. Por favor, revisa tu correo e intenta nuevamente.';
        setRegisterError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Calcular el progreso del formulario
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-brown-50">
      <Navbar />
      
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-start mb-4">
            <BackButton className="text-brown-600 hover:text-brown-800" toPath="/" label="Volver al inicio" />
          </div>
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
              <Coffee className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-brown-900">
              Crea tu cuenta en WorkBuddy
            </h2>
            <p className="mt-2 text-sm text-brown-600">
              O{' '}
              <Link to="/iniciar-sesion" className="font-medium text-green-600 hover:text-green-500">
                inicia sesión si ya tienes una cuenta
              </Link>
            </p>
          </div>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 my-6">
            <div 
              className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* Pasos */}
          <div className="flex justify-center mb-8">
            <span className="text-sm text-brown-700">
              Paso {currentStep} de {totalSteps}
            </span>
          </div>
          
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {registerError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {registerError}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-brown-700">
                      Nombre completo
                    </label>
                    <div className="mt-1">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors.name ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                        placeholder="Juan Pérez"
                      />
                      {errors.name && (
                        <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-brown-700">
                      Correo electrónico
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                        placeholder="tu@correo.com"
                      />
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-brown-700">
                      Contraseña
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors.password ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm pr-10`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      {errors.password && (
                        <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      La contraseña debe tener al menos 8 caracteres
                    </p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-brown-700">
                      Confirmar contraseña
                    </label>
                    <div className="mt-1 relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm pr-10`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      {errors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="mt-2 text-xl font-bold text-brown-900">Verificación por código</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Te hemos enviado un código de verificación a <span className="font-medium">{formData.email}</span>. 
                    Por favor, revisa tu bandeja de entrada y escribe el código a continuación.                  
                  </p>
                  
                  {/* Campo para código de verificación */}
                  <div className="mb-6">
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-brown-700">
                      Código de verificación
                    </label>
                    <div className="mt-1">
                      <input
                        id="verificationCode"
                        name="verificationCode"
                        type="text"
                        autoComplete="one-time-code"
                        value={formData.verificationCode}
                        onChange={handleChange}
                        maxLength={6}
                        placeholder="123456"
                        className={`appearance-none block w-full px-3 py-2 border ${errors.verificationCode ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      />
                      {errors.verificationCode && (
                        <p className="mt-2 text-sm text-red-600">{errors.verificationCode}</p>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      El código de verificación es de 6 caracteres alfanuméricos y se envió a tu correo electrónico.
                    </p>
                  </div>
                  
                  {/* Botones para verificación */}
                  <div className="mt-4 flex justify-between space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-brown-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verificando...
                        </>
                      ) : (
                        "Verificar cuenta"
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-6">
                  {Object.keys(errors).length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">
                            Faltan campos obligatorios
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-brown-700">
                      Número de teléfono
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        maxLength="9" // 8 dígitos + 1 guion
                        className={`appearance-none block w-full pl-10 px-3 py-2 border ${
                          errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                        placeholder="XXXX-XXXX"
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="mt-2 text-sm text-red-600">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-brown-700">
                      Dirección completa
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        autoComplete="street-address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        className={`appearance-none block w-full pl-10 px-3 py-2 border ${
                          errors.address ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                        placeholder="Calle Ejemplo 123, Ciudad, País"
                      />
                    </div>
                    {errors.address && (
                      <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="birthday" className="block text-sm font-medium text-brown-700">
                      Fecha de nacimiento
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="birthday"
                        name="birthday"
                        type="date"
                        required
                        value={formData.birthday}
                        onChange={handleChange}
                        className={`appearance-none block w-full pl-10 px-3 py-2 border ${
                          errors.birthday ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm`}
                      />
                    </div>
                    {errors.birthday && (
                      <p className="mt-2 text-sm text-red-600">{errors.birthday}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Debes ser mayor de 18 años para registrarte
                    </p>
                  </div>

                  <div className="flex items-center mt-4">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-2 block text-sm text-brown-700">
                      Acepto los{' '}
                      <Link to="/terminos-de-servicio" className="text-green-600 hover:text-green-500" target="_blank">
                        Términos de Servicio
                      </Link>{' '}
                      y la{' '}
                      <Link to="/politica-de-privacidad" className="text-green-600 hover:text-green-500" target="_blank">
                        Política de Privacidad
                      </Link>
                    </label>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-brown-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creando cuenta...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Crear cuenta
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-brown-500">O regístrate con</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-brown-700 hover:bg-gray-50"
                >
                  <span className="sr-only">Registrarse con Google</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-brown-700 hover:bg-gray-50"
                >
                  <span className="sr-only">Registrarse con Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
