export type Language = 'es' | 'en' | 'pt';
import { landingImages } from '../config/landingImages';

export const LANGUAGES: Language[] = ['es', 'en', 'pt'];

export const translations = {
    es: {
        nav: {
            library: "Biblioteca Acústica",
            species: "Especies",
            stats: "Estadísticas",
            contact: "Contacto",
        },
        hero: {
            title: "Biblioteca acústica de fauna amazónica - Fonoteca",
            titles_animate: [
                "Biblioteca acústica de fauna amazónica | Fonoteca",
                "Ecosistemas Vivos | Sonidos de la Selva",
                "Biodiversidad Amazónica | Preservación Sonora",
                "Archivo Vivo | La Voz del Amazonas"
            ],
            description: "Una colección sonora que conecta con la biodiversidad amazónica. Descubre la belleza de la naturaleza a través de nuestras grabaciones.",
            cta: "Explorar Ahora"
        },
        intro: {
            label: "Quiénes Somos",
            title_start: "Preservando los",
            title_strong: "Ecosistemas Sonoros",
            p1: "Nuestra fonoteca es un archivo vivo de la biodiversidad. Capturamos, catalogamos y preservamos los sonidos de especies en peligro y ecosistemas únicos para la posteridad y la investigación científica.",
            p2: "Desde el canto de las aves en el Amazonas hasta los infrasonidos de las ballenas, cada grabación cuenta una historia de supervivencia y belleza.",
            link: "Conoce nuestra misión"
        },
        species: {
            label: "Nuestra Colección",
            title: "Explora por",
            title_strong: "Especies",
            items: [
                { title: "Anfibios", count: "117 Especies" },
                { title: "Aves", count: "120 Especies" },
                { title: "Murciélagos", count: "24 Especies" },
                { title: "Grillos", count: "20 Especies" },
            ]
        },
        stats: {
            s1: { count: "773", label: "Grabaciones", desc: "Total de registros de audio" },
            s2: { count: "281", label: "Especies", desc: "Catalogadas en la colección" },
            s3: { count: "48", label: "Familias", desc: "Grupos taxonómicos representados" }
        },
        chart: {
            title_sm: "Resumen Analítico",
            title: "Descubre la distribución de nuestra biblioteca sonora",
            desc: "Explora el desglose de la biodiversidad y descubre las especies que dan forma a nuestro archivo acústico.",
            button: "Ver Directorio Completo",
            classes_title: "Distribución por Clases",
            classes_desc: "Organización taxonómica de nuestra colección, permitiendo un análisis detallado de la representatividad de cada grupo en el ecosistema.",
            growth_title: "Crecimiento de la Colección",
            growth_desc: "Evolución temporal del archivo acústico, reflejando el esfuerzo constante de investigación y catalogación de la biodiversidad amazónica.",
            composition_title: "Composición Bioacústica",
            composition_desc: "Nuestra base de datos se especializa en la captura de firmas sonoras a través de diversos órdenes taxonómicos, priorizando especies con roles críticos en el ecosistema amazónico."
        },
        cta: {
            title_start: "Suscríbete para",
            title_strong: "Novedades Sonoras",
            desc: "Recibe actualizaciones mensuales sobre nuevas especies catalogadas y reportes de salud de los ecosistemas.",
            placeholder: "Tu correo electrónico",
            button: "Suscribirse"
        },
        species_page: {
            banner: {
                title: "Biblioteca acústica de fauna amazónica - Fonoteca",
                subtitle: "Una inmersión sonora en la biodiversidad amazónica",
                image: landingImages.pageBanner.species_es
            },
            list: [
                {
                    id: "rana-mono",
                    name: "Rana Mono Gigante",
                    scientific: "Phyllomedusa bicolor",
                    image: "/data/anfibios/adenomera_hylaedactyla/IMG_0081.JPG",
                    images: [
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Phyllomedusa_bicolor.jpg/1200px-Phyllomedusa_bicolor.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/56230495/large.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/103254922/large.jpg"
                    ],
                    audio: "https://actions.google.com/sounds/v1/animals/frogs_croaking.ogg",
                    description: "Conocida como 'Kambó' o 'Sapo', esta rana arbórea gigante secreta una sustancia cerosa utilizada en la medicina tradicional. Sus ojos plateados y vientre crema la hacen inconfundible.",
                    location: "Cuenca del Amazonas"
                },
                {
                    id: "caiman-anteojos",
                    name: "Caimán de Anteojos",
                    scientific: "Caiman crocodilus",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Spectacled_Caiman_%28Caiman_crocodilus%29.jpg/1200px-Spectacled_Caiman_%28Caiman_crocodilus%29.jpg",
                    images: [
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Spectacled_Caiman_%28Caiman_crocodilus%29.jpg/1200px-Spectacled_Caiman_%28Caiman_crocodilus%29.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/357604/large.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/1826702/large.jpg"
                    ],
                    audio: "https://actions.google.com/sounds/v1/animals/tiger_growl.ogg",
                    description: "Pequeño cocodrilo caracterizado por una cresta ósea entre los ojos que parece un par de anteojos. Es común en caños y lagunas amazónicas.",
                    location: "Reserva Nacional Pacaya Samiria"
                },
                {
                    id: "boa-esmeralda",
                    name: "Boa Esmeralda",
                    scientific: "Corallus caninus",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Corallus_caninus_w_K%C3%B6ln.jpg/1200px-Corallus_caninus_w_K%C3%B6ln.jpg",
                    images: [
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Corallus_caninus_w_K%C3%B6ln.jpg/1200px-Corallus_caninus_w_K%C3%B6ln.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/6321473/large.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/11559850/large.jpg"
                    ],
                    audio: "https://actions.google.com/sounds/v1/animals/snake_hiss.ogg",
                    description: "Serpiente arborícola no venenosa de un verde brillante con manchas blancas. Pasa sus días enrollada en ramas sobre el agua.",
                    location: "Parque Nacional del Manu"
                },
                {
                    id: "rana-dardo-fantasma",
                    name: "Rana Venenosa Fantasma",
                    scientific: "Epipedobates tricolor",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Epipedobates_tricolor.jpg/1200px-Epipedobates_tricolor.jpg",
                    images: [
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Epipedobates_tricolor.jpg/1200px-Epipedobates_tricolor.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/2592500/large.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/8912384/large.jpg"
                    ],
                    audio: "https://actions.google.com/sounds/v1/animals/frogs_croaking.ogg",
                    description: "Pequeña rana venenosa endémica de los Andes y Amazonía. Su canto es similar al de un canario.",
                    location: "Bosques Premontanos"
                },
                {
                    id: "tortuga-taricaya",
                    name: "Taricaya",
                    scientific: "Podocnemis unifilis",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Podocnemis_unifilis_%28Yellow-spotted_River_Turtle%29.jpg/1200px-Podocnemis_unifilis_%28Yellow-spotted_River_Turtle%29.jpg",
                    images: [
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Podocnemis_unifilis_%28Yellow-spotted_River_Turtle%29.jpg/1200px-Podocnemis_unifilis_%28Yellow-spotted_River_Turtle%29.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/1576757/large.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/5482390/large.jpg"
                    ],
                    audio: "https://actions.google.com/sounds/v1/water/stream_water.ogg",
                    description: "Tortuga de río de manchas amarillas. Es fundamental para el ecosistema acuático y sujeto de importantes programas de conservación.",
                    location: "Ríos de la Amazonía"
                },
                {
                    id: "shushupe",
                    name: "Shushupe",
                    scientific: "Lachesis muta",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Lachesis_muta.jpg/1200px-Lachesis_muta.jpg",
                    images: [
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Lachesis_muta.jpg/1200px-Lachesis_muta.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/33284090/large.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/10385732/large.jpg"
                    ],
                    audio: "https://actions.google.com/sounds/v1/animals/snake_hiss.ogg",
                    description: "La víbora más grande del hemisferio occidental. Conocida por sus escamas en forma de piña y su veneno potente.",
                    location: "Bosque Húmedo Tropical"
                },
            ]
        },
        features: {
            title: "Ecosistemas Digitales, Investigación Científica",
            items: [
                { title: "Grabación Bioacústica", description: "Implementamos equipos de alta fidelidad y técnicas proactivas para capturar los sonidos de la fauna en su hábitat natural." },
                { title: "Archivo de Biodiversidad", description: "Un repositorio centralizado y eficiente para la preservación de la memoria sonora de la Amazonía para las generaciones futuras." },
                { title: "Análisis Taxonómico", description: "Contamos con expertos científicos para la identificación precisa de especies a partir de sus firmas acústicas y rasgos biológicos." },
                { title: "Monitoreo Ambiental", description: "Evaluamos la salud de los ecosistemas mediante el análisis de paisajes sonoros y la presencia de especies clave." },
                { title: "Educación y Difusión", description: "Hacemos que la ciencia sea accesible, proporcionando reportes organizados y material educativo sobre nuestra biodiversidad sonora." },
                { title: "Publicaciones Científicas", description: "Facilitamos datos robustos para la investigación académica y la toma de decisiones informadas en conservación." }
            ]
        },
        footer: {
            library: "Biblioteca Acústica",
            description: "Investigación científica para el desarrollo sostenible de la Amazonía Peruana y la puesta en valor de su diversidad biológica y sociocultural.",
            links_title: "Enlaces",
            contact_title: "Contacto",
            address_label: "Dirección Principal",
            address: "Av. José A. Quiñones km 2.5\nIquitos, Loreto - Perú",
            email_label: "Email",
            phone_label: "Teléfono",
            copyright: "© 2025 Instituto de Investigaciones de la Amazonía Peruana. Todos los derechos reservados."
        }
    },
    en: {
        nav: {
            library: "Acoustic Library",
            species: "Species",
            stats: "Statistics",
            contact: "Contact",
        },
        hero: {
            title: "Amazonian Fauna Acoustic Library - Fonoteca",
            titles_animate: [
                "Acoustic Library | Fonoteca",
                "Living Ecosystems | Sounds of the Jungle",
                "Amazon Biodiversity | Sonic Preservation",
                "Living Archive | The Voice of the Amazon"
            ],
            description: "A sound collection connecting you with Amazonian biodiversity. Discover the beauty of nature through our recordings.",
            cta: "Explore Now"
        },
        intro: {
            label: "Who We Are",
            title_start: "Preserving",
            title_strong: "Sound Ecosystems",
            p1: "Our phonotheque is a living archive of biodiversity. We capture, catalog, and preserve sounds of endangered species and unique ecosystems for posterity and scientific research.",
            p2: "From bird songs in the Amazon to whale infrasounds, every recording tells a story of survival and beauty.",
            link: "Know our mission"
        },
        species: {
            label: "Our Collection",
            title: "Explore by",
            title_strong: "Species",
            items: [
                { title: "Amphibians", count: "117 Species" },
                { title: "Birds", count: "120 Species" },
                { title: "Bats", count: "24 Species" },
                { title: "Crickets", count: "20 Species" },
            ]
        },
        stats: {
            s1: { count: "773", label: "Recordings", desc: "Total audio records" },
            s2: { count: "281", label: "Species", desc: "Cataloged in the collection" },
            s3: { count: "48", label: "Families", desc: "Taxonomic groups represented" }
        },
        chart: {
            title_sm: "Analytics Overview",
            title: "Discover the distribution of our sound library",
            desc: "Explore the biodiversity breakdown and uncover the species shaping our acoustic archive.",
            button: "View Complete Directory",
            classes_title: "Distribution by Classes",
            classes_desc: "Taxonomic organization of our collection, allowing a detailed analysis of the representativeness of each group in the ecosystem.",
            growth_title: "Collection Growth",
            growth_desc: "Temporal evolution of the acoustic archive, reflecting the constant effort of research and cataloging of Amazonian biodiversity.",
            composition_title: "Bioacoustic Composition",
            composition_desc: "Our database specializes in capturing sound signatures across various taxonomic orders, prioritizing species with critical roles in the Amazonian ecosystem."
        },
        cta: {
            title_start: "Subscribe for",
            title_strong: "Sound News",
            desc: "Receive monthly updates on newly cataloged species and ecosystem health reports.",
            placeholder: "Your email address",
            button: "Subscribe"
        },
        species_page: {
            banner: {
                title: "Amazonian Fauna Acoustic Library - Fonoteca",
                subtitle: "A sonic immersion in the Amazonian biodiversity",
                image: landingImages.pageBanner.species_en
            },
            list: [
                {
                    id: "rana-mono",
                    name: "Giant Monkey Frog",
                    scientific: "Phyllomedusa bicolor",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Phyllomedusa_bicolor.jpg/1200px-Phyllomedusa_bicolor.jpg",
                    images: [
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Phyllomedusa_bicolor.jpg/1200px-Phyllomedusa_bicolor.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/56230495/large.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/103254922/large.jpg"
                    ],
                    audio: "https://actions.google.com/sounds/v1/animals/frogs_croaking.ogg",
                    description: "Known as 'Kambó', this giant tree frog uses a waxy secretion used in traditional medicine. Its silver eyes and cream belly make it unmistakable.",
                    location: "Amazon Basin"
                },
                {
                    id: "caiman-anteojos",
                    name: "Spectacled Caiman",
                    scientific: "Caiman crocodilus",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Spectacled_Caiman_%28Caiman_crocodilus%29.jpg/1200px-Spectacled_Caiman_%28Caiman_crocodilus%29.jpg",
                    images: [
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Spectacled_Caiman_%28Caiman_crocodilus%29.jpg/1200px-Spectacled_Caiman_%28Caiman_crocodilus%29.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/357604/large.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/1826702/large.jpg"
                    ],
                    audio: "https://actions.google.com/sounds/v1/animals/tiger_growl.ogg",
                    description: "Small crocodilian characterized by a bony ridge between the eyes that resembles spectacles. Common in Amazonian creeks.",
                    location: "Pacaya Samiria National Reserve"
                },
                {
                    id: "boa-esmeralda",
                    name: "Emerald Tree Boa",
                    scientific: "Corallus caninus",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Corallus_caninus_w_K%C3%B6ln.jpg/1200px-Corallus_caninus_w_K%C3%B6ln.jpg",
                    images: [
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Corallus_caninus_w_K%C3%B6ln.jpg/1200px-Corallus_caninus_w_K%C3%B6ln.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/6321473/large.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/11559850/large.jpg"
                    ],
                    audio: "https://actions.google.com/sounds/v1/animals/snake_hiss.ogg",
                    description: "Non-venomous arboreal snake of bright green with white markings. Spends its days coiled on branches over water.",
                    location: "Manu National Park"
                },
                {
                    id: "rana-dardo-fantasma",
                    name: "Phantasmal Poison Frog",
                    scientific: "Epipedobates tricolor",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Epipedobates_tricolor.jpg/1200px-Epipedobates_tricolor.jpg",
                    images: [
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Epipedobates_tricolor.jpg/1200px-Epipedobates_tricolor.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/2592500/large.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/8912384/large.jpg"
                    ],
                    audio: "https://actions.google.com/sounds/v1/animals/frogs_croaking.ogg",
                    description: "Small poison frog endemic to the Andes and Amazon. Its call is similar to a canary.",
                    location: "Premontane Forests"
                },
                {
                    id: "tortuga-taricaya",
                    name: "Yellow-spotted River Turtle",
                    scientific: "Podocnemis unifilis",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Podocnemis_unifilis_%28Yellow-spotted_River_Turtle%29.jpg/1200px-Podocnemis_unifilis_%28Yellow-spotted_River_Turtle%29.jpg",
                    images: [
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Podocnemis_unifilis_%28Yellow-spotted_River_Turtle%29.jpg/1200px-Podocnemis_unifilis_%28Yellow-spotted_River_Turtle%29.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/1576757/large.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/5482390/large.jpg"
                    ],
                    audio: "https://actions.google.com/sounds/v1/water/stream_water.ogg",
                    description: "River turtle with yellow spots. Essential for the aquatic ecosystem and subject of important conservation programs.",
                    location: "Amazon Rivers"
                },
                {
                    id: "shushupe",
                    name: "Bushmaster",
                    scientific: "Lachesis muta",
                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Lachesis_muta.jpg/1200px-Lachesis_muta.jpg",
                    images: [
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Lachesis_muta.jpg/1200px-Lachesis_muta.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/33284090/large.jpg",
                        "https://inaturalist-open-data.s3.amazonaws.com/photos/10385732/large.jpg"
                    ],
                    audio: "https://actions.google.com/sounds/v1/animals/snake_hiss.ogg",
                    description: "The largest viper in the Western Hemisphere. Known for its pineapple-like scales and potent venom.",
                    location: "Tropical Rainforest"
                },
            ]
        },
        features: {
            title: "Digital Ecosystems, Scientific Research",
            items: [
                { title: "Bioacoustic Recording", description: "We implement high-fidelity equipment and proactive techniques to capture fauna sounds in their natural habitat." },
                { title: "Biodiversity Archive", description: "A centralized and efficient repository for preserving the sonic memory of the Amazon for future generations." },
                { title: "Taxonomic Analysis", description: "We rely on scientific experts for the precise identification of species through their acoustic signatures and biological traits." },
                { title: "Environmental Monitoring", description: "We evaluate ecosystem health through soundscape analysis and the presence of key species." },
                { title: "Education & Outreach", description: "We make science accessible by providing organized reports and educational material about our sonic biodiversity." },
                { title: "Scientific Publications", description: "We facilitate robust data for academic research and informed decision-making in conservation." }
            ]
        },
        footer: {
            library: "Acoustic Library",
            description: "Scientific research for the sustainable development of the Peruvian Amazon and the enhancement of its biological and cultural diversity.",
            links_title: "Links",
            contact_title: "Contact",
            address_label: "Main Address",
            address: "Av. José A. Quiñones km 2.5\nIquitos, Loreto - Peru",
            email_label: "Email",
            phone_label: "Phone",
            copyright: "© 2025 Research Institute of the Peruvian Amazon. All rights reserved."
        }
    },
    pt: {
        nav: {
            library: "Biblioteca Acústica",
            species: "Espécies",
            stats: "Estatísticas",
            contact: "Contato",
        },
        hero: {
            title: "Biblioteca acústica de fauna Amazônica - Fonoteca",
            titles_animate: [
                "Biblioteca acústica | Fonoteca",
                "Ecossistemas Vivos | Sons da Selva",
                "Biodiversidade Amazônica | Preservação Sonora",
                "Arquivo Vivo | A Voz do Amazonas"
            ],
            description: "Uma coleção sonora que conecta com a biodiversidade amazônica. Descubra a beleza da natureza através de nossas gravações.",
            cta: "Explorar Agora"
        },
        intro: {
            label: "Quem Somos",
            title_start: "Preservando os",
            title_strong: "Ecossistemas Sonoros",
            p1: "Nossa fonoteca é um arquivo vivo da biodiversidade. Capturamos, catalogamos e preservamos os sons de espécies ameaçadas e ecossistemas únicos para a posteridade e a pesquisa científica.",
            p2: "Do canto dos pássaros na Amazônia aos infrassons das baleias, cada gravação conta uma história de sobrevivência e beleza.",
            link: "Conheça nossa missão"
        },
        species: {
            label: "Nossa Coleção",
            title: "Explore por",
            title_strong: "Espécies",
            items: [
                { title: "Anfíbios", count: "117 Espécies" },
                { title: "Aves", count: "120 Espécies" },
                { title: "Morcegos", count: "24 Espécies" },
                { title: "Grilos", count: "20 Espécies" },
            ]
        },
        stats: {
            s1: { count: "773", label: "Gravações", desc: "Total de registros de áudio" },
            s2: { count: "281", label: "Espécies", desc: "Catalogadas na coleção" },
            s3: { count: "48", label: "Famílias", desc: "Grupos taxonômicos representados" }
        },
        chart: {
            title_sm: "Visão Geral Analítica",
            title: "Descubra a distribuição de nossa biblioteca sonora",
            desc: "Explore a divisão da biodiversidade e descubra as espécies que moldam nosso arquivo acústico.",
            button: "Ver Diretório Completo",
            classes_title: "Distribuição por Classes",
            classes_desc: "Organização taxonômica de nossa coleção, permitindo uma análise detalhada da representatividade de cada grupo no ecossistema.",
            growth_title: "Crescimento da Coleção",
            growth_desc: "Evolução temporal do arquivo acústico, refletindo o esforço constante de pesquisa e catalogação da biodiversidade amazônica.",
            composition_title: "Composição Bioacústica",
            composition_desc: "Nossa base de dados se especializa na captura de assinaturas sonoras através de diversos ordens taxonômicas, priorizando espécies com papéis críticos no ecossistema amazônico."
        },
        cta: {
            title_start: "Inscreva-se para",
            title_strong: "Novidades Sonoras",
            desc: "Receba atualizações mensais sobre novas espécies catalogadas e relatórios de saúde dos ecossistemas.",
            placeholder: "Seu endereço de e-mail",
            button: "Inscrever-se"
        },
        species_page: {
            banner: {
                title: "Biblioteca acústica de fauna Amazônica - Fonoteca",
                subtitle: "Uma imersão sonora na biodiversidade amazônica",
                image: landingImages.pageBanner.species_en
            },
            list: [
                {
                    id: "rana-dardo",
                    name: "Sapo Ponta-de-Flecha",
                    scientific: "Ranitomeya ventrimaculata",
                    image: "https://images.unsplash.com/photo-1599488615731-7e5128091dd7?q=80&w=1000&auto=format&fit=crop",
                    images: [
                        "https://images.unsplash.com/photo-1599488615731-7e5128091dd7?q=80&w=1000&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1549498263-84b2383c2763?q=80&w=1000&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1582697816664-96894c483af9?q=80&w=1000&auto=format&fit=crop"
                    ],
                    audio: "https://actions.google.com/sounds/v1/animals/frogs_croaking.ogg",
                    description: "Este pequeno sapo venenoso é conhecido por suas cores brilhantes e padrões únicos. Habita o sub-bosque da floresta amazônica e é um indicador chave da saúde do ecossistema.",
                    location: "Reserva Nacional Allpahuayo Mishana"
                },
                {
                    id: "guacamayo",
                    name: "Arara Vermelha",
                    scientific: "Ara macao",
                    image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=1000&auto=format&fit=crop",
                    images: [
                        "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?q=80&w=1000&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1551092892-273644265158?q=80&w=1000&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1522857476332-6bf59a1844b2?q=80&w=1000&auto=format&fit=crop"
                    ],
                    audio: "https://actions.google.com/sounds/v1/animals/parrot.ogg",
                    description: "Com sua plumagem escarlate, amarela e azul, a arara vermelha é uma das aves mais emblemáticas da Amazônia. Seus grasnidos fortes ecoam pelo dossel da floresta.",
                    location: "Parque Nacional do Manu"
                },
                {
                    id: "mono-ardilla",
                    name: "Macaco-de-Cheiro",
                    scientific: "Saimiri sciureus",
                    image: "https://images.unsplash.com/photo-1548685913-fe65780eb1d7?q=80&w=1000&auto=format&fit=crop",
                    images: [
                        "https://images.unsplash.com/photo-1548685913-fe65780eb1d7?q=80&w=1000&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1565063073740-4107dc6ad521?q=80&w=1000&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1535930749574-1399327ce78f?q=80&w=1000&auto=format&fit=crop"
                    ],
                    audio: "https://actions.google.com/sounds/v1/animals/monkey_screech.ogg",
                    description: "Pequenos, ágeis e altamente sociais, os macacos-de-cheiro viajam em grandes bandos. Suas vocalizações são complexas e vitais para a coesão do grupo.",
                    location: "Reserva Nacional Pacaya Samiria"
                },
                {
                    id: "jaguar",
                    name: "Onça-Pintada",
                    scientific: "Panthera onca",
                    image: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?q=80&w=1000&auto=format&fit=crop",
                    images: [
                        "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?q=80&w=1000&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1629813296837-774900cb34b6?q=80&w=1000&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1615963244664-5b845b2025ee?q=80&w=1000&auto=format&fit=crop"
                    ],
                    audio: "https://actions.google.com/sounds/v1/animals/tiger_growl.ogg",
                    description: "O maior felino das Américas. A onça-pintada é um predador chave e um símbolo de poder na cosmovisão amazônica. Seu rugido é profundo e ressonante.",
                    location: "Parque Nacional Bahuaja Sonene"
                },
                {
                    id: "tucan",
                    name: "Tucano",
                    scientific: "Ramphastos toco",
                    image: "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=1000&auto=format&fit=crop",
                    images: [
                        "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=1000&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1628045997232-a544b6f00114?q=80&w=1000&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1623953530869-fa7166164d1f?q=80&w=1000&auto=format&fit=crop"
                    ],
                    audio: "https://actions.google.com/sounds/v1/animals/crow_caw.ogg",
                    description: "Famoso por seu enorme bico colorido. O tucano é um importante dispersor de sementes na floresta. Seu canto é um som característico do amanhecer amazônico.",
                    location: "Reserva Comunal Tamshiyacu Tahuayo"
                },
                {
                    id: "delfin-rosado",
                    name: "Boto Cor-de-Rosa",
                    scientific: "Inia geoffrensis",
                    image: "https://images.unsplash.com/photo-1568285984638-513d6a2dc907?q=80&w=1000&auto=format&fit=crop",
                    images: [
                        "https://images.unsplash.com/photo-1568285984638-513d6a2dc907?q=80&w=1000&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1606735584500-a63e8a39a263?q=80&w=1000&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1544552866-d3ed42536de7?q=80&w=1000&auto=format&fit=crop"
                    ],
                    audio: "https://actions.google.com/sounds/v1/animals/dolphin_chatter.ogg",
                    description: "O mítico boto cor-de-rosa habita os rios da Amazônia. É uma espécie inteligente e curiosa, envolta em lendas locais.",
                    location: "Rio Amazonas, Iquitos"
                },
            ]
        },
        features: {
            title: "Ecossistemas Digitais, Pesquisa Científica",
            items: [
                { title: "Gravação Bioacústica", description: "Implementamos equipamentos de alta fidelidade e técnicas proativas para capturar os sons da fauna em seu habitat natural." },
                { title: "Arquivo de Biodiversidade", description: "Um repositório centralizado e eficiente para a preservação da memória sonora da Amazônia para as futuras gerações." },
                { title: "Análise Taxonômica", description: "Contamos com especialistas científicos para a identificação precisa de espécies a partir de suas assinaturas acústicas." },
                { title: "Monitoramento Ambiental", description: "Avaliamos a saúde dos ecossistemas através do análise de paisagens sonoras e da presença de espécies-chave." },
                { title: "Educação e Difusão", description: "Tornamos a ciência acessível, fornecendo relatórios organizados e material educativo sobre nossa biodiversidade sonora." },
                { title: "Publicações Científicas", description: "Facilitamos datos robustos para a pesquisa acadêmica e a tomada de decisões informadas em conservação." }
            ]
        },
        footer: {
            library: "Biblioteca Acústica",
            description: "Pesquisa científica para o desenvolvimento sustentável da Amazônia Peruana e a valorização de sua diversidade biológica e sociocultural.",
            links_title: "Links",
            contact_title: "Contato",
            address_label: "Endereço Principal",
            address: "Av. José A. Quiñones km 2.5\nIquitos, Loreto - Peru",
            email_label: "Email",
            phone_label: "Telefone",
            copyright: "© 2025 Instituto de Pesquisa da Amazônia Peruana. Todos os direitos reservados."
        }
    }
};
