import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    X,
    Trash2,
    FolderHeart,
    FileAudio,
    User,
    Mail,
    Building2,
    BookOpen,
    Send,
    CheckCircle2,
    Loader2,
    Lock
} from 'lucide-react';
import { useAudioRequestStore, type CartItem } from '../../store/useAudioRequestStore';
import { supabase } from '../../lib/supabase';

interface AudioRequestCartProps {
    lang: string;
}

const cartTranslations = {
    es: {
        title: "Solicitud de Audios Científicos",
        emptyCartTitle: "Tu solicitud está vacía",
        emptyCartDesc: "Explora la biblioteca acústica y añade cantos o grabaciones de especies a tu solicitud para iniciar el proceso.",
        addToRequest: "Añadir a Solicitud",
        inRequest: "En la Solicitud",
        fullName: "Nombre completo",
        institution: "Institución científica o Universidad",
        email: "Correo electrónico institucional",
        category: "Categoría de uso",
        rationale: "Propósito de uso (Rationale científico)",
        rationalePlaceholder: "Describa detalladamente su plan de investigación o proyecto...",
        tos: "Me comprometo a citar la base de datos de la Fonoteca bajo el estándar Darwin Core y no comercializar ni distribuir el material sin dar los créditos científicos correspondientes.",
        backBtn: "Volver al carrito",
        proceedBtn: "Continuar con la solicitud",
        submitBtn: "Enviar solicitud formal",
        successTitle: "¡Solicitud Registrada!",
        successDesc: "Su solicitud ha sido registrada en el panel curatorial. Evaluaremos su rationale científico a la brevedad y, tras la aprobación, recibirá un enlace efímero (válido por 48 horas) en su correo institucional para descargar los archivos .wav originales.",
        closeBtn: "Cerrar",
        requiredField: "Este campo es requerido",
        invalidEmail: "Ingrese un correo electrónico institucional válido",
        shortRationale: "El propósito de uso debe tener al menos 15 caracteres",
        acceptTermsError: "Debe aceptar los términos de uso científico para proceder",
        submittingText: "Procesando solicitud...",
        scientificName: "Nombre Científico",
        vocalization: "Vocalización",
        itemsLabel: "Audios seleccionados",
        categories: {
            academic_thesis: "Tesis o Grado Académico",
            scientific_publication: "Artículo o Publicación Científica",
            conservation_project: "Proyecto de Conservación y Manejo",
            commercial: "Uso Comercial (Documentales, Medios)"
        }
    },
    en: {
        title: "Scientific Audio Request",
        emptyCartTitle: "Your request is empty",
        emptyCartDesc: "Explore the acoustic library and add recordings or species calls to your request to begin.",
        addToRequest: "Add to Request",
        inRequest: "In Request",
        fullName: "Full name",
        institution: "Scientific Institution or University",
        email: "Institutional email address",
        category: "Usage category",
        rationale: "Purpose of use (Scientific rationale)",
        rationalePlaceholder: "Describe in detail your research plan or project...",
        tos: "I agree to cite the Acoustic Library database under the Darwin Core standard and not to sell or distribute the material without proper scientific attribution.",
        backBtn: "Back to cart",
        proceedBtn: "Proceed to request",
        submitBtn: "Submit formal request",
        successTitle: "Request Submitted!",
        successDesc: "Your request has been registered in the curatorial panel. We will evaluate your scientific rationale shortly. Upon approval, you will receive an ephemeral link (valid for 48 hours) in your institutional email to download the original .wav files.",
        closeBtn: "Close",
        requiredField: "This field is required",
        invalidEmail: "Please enter a valid institutional email address",
        shortRationale: "The rationale must be at least 15 characters long",
        acceptTermsError: "You must accept the terms of scientific use to proceed",
        submittingText: "Processing request...",
        scientificName: "Scientific Name",
        vocalization: "Vocalization",
        itemsLabel: "Selected Audios",
        categories: {
            academic_thesis: "Thesis or Academic Degree",
            scientific_publication: "Scientific Paper or Publication",
            conservation_project: "Conservation and Management Project",
            commercial: "Commercial Use (Documentaries, Media)"
        }
    },
    pt: {
        title: "Solicitação de Áudios Científicos",
        emptyCartTitle: "Sua solicitação está vazia",
        emptyCartDesc: "Explore a biblioteca acústica e adicione gravações ou cantos de espécies à sua solicitação para começar.",
        addToRequest: "Adicionar à Solicitação",
        inRequest: "Na Solicitação",
        fullName: "Nome completo",
        institution: "Instituição científica ou Universidade",
        email: "Endereço de e-mail institucional",
        category: "Categoria de uso",
        rationale: "Propósito de uso (Rationale científico)",
        rationalePlaceholder: "Descreva detalhadamente seu plano de pesquisa ou projeto...",
        tos: "Comprometo-me a citar o banco de dados da Fonoteca sob o padrão Darwin Core e a não comercializar ou distribuir o material sem a devida atribuição científica.",
        backBtn: "Voltar ao carrinho",
        proceedBtn: "Continuar com a solicitação",
        submitBtn: "Enviar solicitação formal",
        successTitle: "Solicitação Registrada!",
        successDesc: "Sua solicitação foi registrada no painel curatorial. Avaliaremos seu rationale científico em breve. Após a aprovação, você receberá um link efêmero (válido por 48 horas) em seu e-mail institucional para baixar os arquivos .wav originais.",
        closeBtn: "Fechar",
        requiredField: "Este campo é obrigatório",
        invalidEmail: "Insira um endereço de e-mail institucional válido",
        shortRationale: "O rationale deve ter pelo menos 15 caracteres",
        acceptTermsError: "Você deve aceitar os termos de uso científico para prosseguir",
        submittingText: "Processando solicitação...",
        scientificName: "Nome Científico",
        vocalization: "Vocalização",
        itemsLabel: "Áudios Selecionados",
        categories: {
            academic_thesis: "Tese ou Grau Acadêmico",
            scientific_publication: "Artigo ou Publicação Científica",
            conservation_project: "Projeto de Conservação e Manejo",
            commercial: "Uso Comercial (Documentários, Mídia)"
        }
    }
};

export const AudioRequestCart: React.FC<AudioRequestCartProps> = ({ lang }) => {
    const activeLang = (lang === 'es' || lang === 'en' || lang === 'pt') ? lang : 'es';
    const t = cartTranslations[activeLang];

    const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, clearCart } = useAudioRequestStore();

    const [step, setStep] = useState<'cart' | 'form' | 'success'>('cart');

    // Form States
    const [fullName, setFullName] = useState('');
    const [institution, setInstitution] = useState('');
    const [email, setEmail] = useState('');
    const [category, setCategory] = useState<keyof typeof cartTranslations.es.categories>('academic_thesis');
    const [rationale, setRationale] = useState('');
    const [acceptTOS, setAcceptTOS] = useState(false);

    // Error/Loading states
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    if (!isCartOpen) return null;

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!fullName.trim()) newErrors.fullName = t.requiredField;
        if (!institution.trim()) newErrors.institution = t.requiredField;

        if (!email.trim()) {
            newErrors.email = t.requiredField;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = t.invalidEmail;
        }

        if (!rationale.trim()) {
            newErrors.rationale = t.requiredField;
        } else if (rationale.trim().length < 15) {
            newErrors.rationale = t.shortRationale;
        }

        if (!acceptTOS) newErrors.tos = t.acceptTermsError;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        setServerError(null);

        try {
            // 1. Submit Request details
            const { data: requestData, error: requestError } = await (supabase as any)
                .from('audio_requests')
                .insert({
                    requester_name: fullName.trim(),
                    institution: institution.trim(),
                    requester_email: email.trim().toLowerCase(),
                    observation_rationale: `${rationale.trim()} [Category: ${category}]`,
                    request_status: 'pending'
                })
                .select()
                .single();

            if (requestError) throw requestError;

            // 2. Submit items mapped to the request id
            const requestItems = cartItems.map((item) => ({
                request_id: requestData.id,
                multimedia_id: item.multimediaId
            }));

            const { error: itemsError } = await (supabase as any)
                .from('audio_request_items')
                .insert(requestItems);

            if (itemsError) throw itemsError;

            // Notify admin app to trigger confirmation & alert emails
            try {
                const adminBaseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
                    ? 'http://localhost:3006'
                    : '';
                await fetch(`${adminBaseUrl}/api/audio-requests/created`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ requestId: requestData.id }),
                });
            } catch (notifyErr) {
                console.error('Failed to trigger notification emails:', notifyErr);
            }

            // Success Transition
            setStep('success');
        } catch (err: any) {
            console.error('Error submitting audio request:', err);
            setServerError(err.message || 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (step === 'success') {
            clearCart();
            setStep('cart');
            // Clear form
            setFullName('');
            setInstitution('');
            setEmail('');
            setCategory('academic_thesis');
            setRationale('');
            setAcceptTOS(false);
        }
        setIsCartOpen(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end font-sans">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#0a0f18]/80 backdrop-blur-sm cursor-pointer"
                onClick={handleClose}
            />

            {/* Drawer Body */}
            <div className="relative w-full max-w-lg h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col z-10 border-l border-gray-100 dark:border-gray-800">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-tight uppercase flex items-center gap-2">
                        {t.title}
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {step === 'cart' && (
                        <>
                            {cartItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                                    <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-600">
                                        <FolderHeart size={36} />
                                    </div>
                                    <h4 className="text-base font-bold text-gray-800 dark:text-gray-200">{t.emptyCartTitle}</h4>
                                    <p className="text-xs text-gray-400 max-w-sm leading-relaxed">{t.emptyCartDesc}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-xs font-black tracking-widest text-gray-400 uppercase">
                                        <span>{t.itemsLabel}</span>
                                        <span>{cartItems.length}</span>
                                    </div>
                                    <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-950">
                                        {cartItems.map((item) => (
                                            <div key={item.multimediaId} className="p-4 flex justify-between items-start gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition-colors">
                                                <div className="space-y-1 min-w-0">
                                                    <p className="text-xs font-semibold text-accent-green leading-none italic">{item.scientificName}</p>
                                                    <h5 className="text-sm font-bold text-gray-800 dark:text-white truncate" title={item.title}>
                                                        {item.title || 'Grabación bioacústica'}
                                                    </h5>
                                                    {item.vocalizationType && (
                                                        <span className="inline-block px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500 uppercase">
                                                            {item.vocalizationType}
                                                        </span>
                                                    )}
                                                    {item.duration && (
                                                        <span className="text-[10px] text-gray-400 ml-2">
                                                            {item.duration.toFixed(1)}s
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.multimediaId)}
                                                    className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                    title="Remove item"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {step === 'form' && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {serverError && (
                                <div className="p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold">
                                    {serverError}
                                </div>
                            )}

                            {/* Full Name */}
                            <div className="space-y-1">
                                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t.fullName} *</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-green transition-all ${errors.fullName ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'
                                            }`}
                                        disabled={submitting}
                                    />
                                </div>
                                {errors.fullName && <p className="text-[10px] text-red-500">{errors.fullName}</p>}
                            </div>

                            {/* Institution */}
                            <div className="space-y-1">
                                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t.institution} *</label>
                                <div className="relative">
                                    <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={institution}
                                        onChange={(e) => setInstitution(e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-green transition-all ${errors.institution ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'
                                            }`}
                                        disabled={submitting}
                                    />
                                </div>
                                {errors.institution && <p className="text-[10px] text-red-500">{errors.institution}</p>}
                            </div>

                            {/* Email */}
                            <div className="space-y-1">
                                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t.email} *</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-green transition-all ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'
                                            }`}
                                        disabled={submitting}
                                    />
                                </div>
                                {errors.email && <p className="text-[10px] text-red-500">{errors.email}</p>}
                            </div>

                            {/* Usage Category */}
                            <div className="space-y-1">
                                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t.category} *</label>
                                <div className="relative">
                                    <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as any)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-green transition-all appearance-none cursor-pointer"
                                        disabled={submitting}
                                    >
                                        {Object.entries(t.categories).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Rationale */}
                            <div className="space-y-1">
                                <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t.rationale} *</label>
                                <textarea
                                    value={rationale}
                                    onChange={(e) => setRationale(e.target.value)}
                                    placeholder={t.rationalePlaceholder}
                                    rows={4}
                                    className={`w-full px-4 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-green transition-all resize-none ${errors.rationale ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'
                                        }`}
                                    disabled={submitting}
                                />
                                {errors.rationale && <p className="text-[10px] text-red-500">{errors.rationale}</p>}
                            </div>

                            {/* Legal TOS */}
                            <div className="space-y-1 pt-2">
                                <label className="flex gap-3 items-start select-none cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={acceptTOS}
                                        onChange={(e) => setAcceptTOS(e.target.checked)}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-accent-green focus:ring-accent-green"
                                        disabled={submitting}
                                    />
                                    <span className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal font-medium">
                                        {t.tos}
                                    </span>
                                </label>
                                {errors.tos && <p className="text-[10px] text-red-500">{errors.tos}</p>}
                            </div>
                        </form>
                    )}

                    {step === 'success' && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                className="w-16 h-16 rounded-full bg-accent-green/10 flex items-center justify-center text-accent-green"
                            >
                                <CheckCircle2 size={36} />
                            </motion.div>
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white">{t.successTitle}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                                {t.successDesc}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex flex-col gap-3">
                    {step === 'cart' && (
                        <button
                            onClick={() => setStep('form')}
                            disabled={cartItems.length === 0}
                            className="w-full py-3 bg-accent-green hover:bg-accent-green-dark text-white rounded-lg text-xs font-black tracking-widest uppercase transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t.proceedBtn}
                        </button>
                    )}

                    {step === 'form' && (
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setStep('cart')}
                                className="col-span-1 py-3 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-850 text-gray-600 dark:text-gray-300 rounded-lg text-[10px] font-bold uppercase transition-colors"
                                disabled={submitting}
                            >
                                {t.backBtn}
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="col-span-2 py-3 bg-accent-green hover:bg-accent-green-dark text-white rounded-lg text-xs font-black tracking-widest uppercase transition-colors shadow-sm flex items-center justify-center gap-2"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>{t.submittingText}</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={12} />
                                        <span>{t.submitBtn}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {step === 'success' && (
                        <button
                            onClick={handleClose}
                            className="w-full py-3 bg-accent-green hover:bg-accent-green-dark text-white rounded-lg text-xs font-black tracking-widest uppercase transition-colors shadow-sm"
                        >
                            {t.closeBtn}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};
