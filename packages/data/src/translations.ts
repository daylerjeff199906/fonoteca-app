export type Language = 'es' | 'en' | 'pt';

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
                image: "/assets/banner.jpg"
            },
            list: []
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
                image: "/assets/banner.jpg"
            },
            list: []
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
            title_start: "Preservando los",
            title_strong: "Ecossistemas Sonoros",
            p1: "Nuestra fonoteca es un archivo vivo de la biodiversidad. Capturamos, catalogamos y preservamos los sons de espécies ameaçadas e ecossistemas únicos para a posteridade e a pesquisa científica.",
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
            classes_title: "Distribuição por Clases",
            classes_desc: "Organização taxonômica de nossa coleção, permitindo uma análise detalhada da representatividade de cada grupo no ecossistema.",
            growth_title: "Crescimento da Coleção",
            growth_desc: "Evolução temporal do arquivo acústico, refletindo o esforço constante de pesquisa e catalogação da biodiversidade amazônica.",
            composition_title: "Composição Bioacústica",
            composition_desc: "Nossa base de datos se especializa na captura de assinaturas sonoras através de diversos ordens taxonômicas, priorizando espécies com papéis críticos no ecossistema amazônico."
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
                image: "/assets/banner.jpg"
            },
            list: []
        },
        features: {
            title: "Ecossistemas Digitais, Pesquisa Científica",
            items: [
                { title: "Gravação Bioacústica", description: "Implementamos equipamentos de alta fidelidade e técnicas proativas para capturar os sons da fauna em seu habitat natural." },
                { title: "Arquivo de Biodiversidade", description: "Um repositório centralizado e eficiente para a preservação da memória sonora da Amazônia para as futuras gerações." },
                { title: "Análise Taxonômica", description: "Contamos com especialistas científicos para a identificação precisa de espécies a partir de suas assinaturas acústicas." },
                { title: "Monitoramento Ambiental", description: "Avaliamos a saúde dos ecossistemas através do análise de paisagens sonoras e da presença de espécies-chave." },
                { title: "Educação e Difusão", description: "Tornamos a ciência acessível, fornecendo relatórios organizados e material educativo sobre nossa biodiversidade sonora." },
                { title: "Publicaciones Científicas", description: "Facilitamos datos robustos para a pesquisa acadêmica e a tomada de decisões informadas em conservação." }
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
