import { useEffect, useRef, useState } from 'react';
// IMPORTANTE: Trocando Mapbox por Leaflet
import L, { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Importa o CSS do Leaflet

import { mockSchools, type School } from '@/data/schools';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Users, GraduationCap, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// IMPORTANTE: Configuração de Ícone para corrigir o marcador padrão do Leaflet
// Isso é necessário pois o Webpack/Vite tem dificuldade em encontrar os ícones padrão
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
// Fim da correção do ícone

interface MapComponentProps {
  selectedSchool?: string;
  onSchoolSelect?: (school: School) => void;
}

const MapComponent = ({ selectedSchool, onSchoolSelect }: MapComponentProps) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    // Tipagem alterada para LeafletMap (L.Map)
    const map = useRef<LeafletMap | null>(null); 
    const [selectedPopup, setSelectedPopup] = useState<School | null>(null);
    const navigate = useNavigate();

    // -------------------------------------------------------------------------
    // Função para renderizar o mapa (o coração da mudança)
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (!mapContainer.current) return;

        // Verifica se o mapa já foi inicializado para evitar duplicidade
        if (map.current) {
             // Limpeza se o mapa já existir (para evitar warnings em desenvolvimento)
             map.current.remove();
             map.current = null;
        }

        // 1. Inicializa o mapa no elemento 'div' com o id="mapa"
        // Coordenadas de Salvador: [-12.9714, -38.5014]
        map.current = L.map(mapContainer.current!).setView([-12.9714, -38.5014], 13);

        // 2. Adiciona os Tiles (OpenStreetMap - 100% gratuito)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map.current!);

        // 3. Adiciona marcadores para as escolas
        mockSchools.forEach((school) => {
            // Cria um marcador (L.marker) com as coordenadas
            const marker = L.marker(school.coordinates as [number, number], {
                // Leaflet usa a propriedade 'icon' para customização. 
                // Para customizar a cor, precisaremos de ícones SVG ou imagens customizadas.
                // Usaremos o ícone padrão por enquanto.
            })
            .addTo(map.current!);

            // Cria o HTML do popup (igual à sua estrutura de Card, mas em string)
            const popupContent = `
                <div class="p-2 font-montserrat" style="max-width: 250px;">
                    <h3 class="font-poppins font-bold text-lg" style="color: #000;">${school.name}</h3>
                    <p class="text-sm mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF8C00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${school.neighborhood}</p>
                    <div class="space-y-1 mb-3">
                        <div class="flex items-center text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFC700" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-2"><path d="M4 19.5a2.5 2.5 0 0 1 2.5-2.5h15"></path><path d="M21.5 7.5a2.5 2.5 0 0 0-2.5-2.5h-15"></path></svg>
                            <span>${school.periods.slice(0, 2).join(', ')}</span>
                        </div>
                        <div class="text-sm">
                            <div class="font-semibold" style="color: #FF8C00;">Professores Instrutores:</div>
                            <div class="text-xs max-h-12 overflow-y-auto pl-4">
                                ${school.instructors.map(i => `<div>${i.name} - ${i.subject}</div>`).join('')}
                            </div>
                        </div>
                    </div>
                    <button id="details-btn-${school.id}" class="w-full px-3 py-2 rounded-lg font-poppins font-semibold" style="background-color: #FFC700; color: #000; border: none; cursor: pointer;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-2"><path d="M15 3h6v6"></path><path d="M10 14L21 3"></path><path d="M18 19H6c-1.1 0-2-.9-2 2V7c0-1.1.9-2 2-2h5"></path></svg>
                        Ver Detalhes
                    </button>
                </div>
            `;
            
            // 4. Conecta o Popup ao marcador
            marker.bindPopup(popupContent, {
                // Opção para fechar o popup ao clicar em outro
                autoClose: false,
                closeOnClick: false 
            });

            // 5. Adiciona um Listener ao evento de 'click' do marcador
            // Usamos o evento Leaflet, e não o elemento DOM (como no Mapbox)
            marker.on('click', () => {
                 setSelectedPopup(school);
                 onSchoolSelect?.(school);
                 
                 // Adiciona listener ao botão APÓS o popup ser aberto (ou o DOM é criado)
                 // É uma forma menos "React" de fazer, mas funciona com popups do Leaflet
                 setTimeout(() => {
                    const detailButton = document.getElementById(`details-btn-${school.id}`);
                    if (detailButton) {
                        detailButton.onclick = () => handleViewDetails(school.id);
                    }
                 }, 0);
            });
        });

        // Cleanup function
        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, [onSchoolSelect, navigate]); // Adicionado 'navigate' nas dependências

    // -------------------------------------------------------------------------
    // Funções de Ação (Mantidas as suas funções originais de navegação)
    // -------------------------------------------------------------------------

    // A função de clique no Mock Pin (removeremos o Mock Map)
    // Foi adaptada para o funcionamento do Leaflet, onde o click no Pin abre o popup.
    const handleViewDetails = (schoolId: string) => {
        navigate(`/escola/${schoolId}`);
    };
    
    // A função handleSchoolClick e o estado selectedPopup se tornam menos críticos 
    // para a exibição do popup em si (que é nativa do Leaflet), mas mantemos para 
    // a comunicação com o componente pai (onSchoolSelect).

    // -------------------------------------------------------------------------
    // Renderização (Retirando o Mock Map e mantendo apenas o contêiner do Leaflet)
    // -------------------------------------------------------------------------
    return (
        <div className="relative w-full h-full">
            {/* Contêiner REAL do Mapa Leaflet */}
            <div 
                ref={mapContainer} 
                id="leaflet-map-container" // ID útil para estilização específica
                className="w-full h-full relative"
            >
                {/* Aqui será onde o Leaflet injetará o mapa */}
            </div>

            {/* A Barra de Busca e os Botões de Zoom do Mapbox foram adaptados: */}
            {/* Map Search Bar - Mantido, é apenas um componente de UI sobreposto */}
            <div className="absolute top-4 left-4 right-4 z-[401]">
                <div className="max-w-md">
                    <input
                        type="text"
                        placeholder="Buscar escolas..."
                        className="w-full px-3 py-2 rounded-lg border bg-white/95 backdrop-blur-sm shadow-sm font-montserrat text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            {/* Map Controls - Botões de zoom personalizados (ou remova e use os nativos do Leaflet) */}
            {/* O Leaflet adiciona botões de zoom automaticamente, você pode removê-los se usar os seus: */}
            <div className="absolute top-4 right-4 space-y-2 z-[401]">
                {/* Você pode chamar map.current.zoomIn() e map.current.zoomOut() aqui */}
                <Button variant="map" size="map" onClick={() => map.current?.zoomIn()}>
                    Zoom +
                </Button>
                <Button variant="map" size="map" onClick={() => map.current?.zoomOut()}>
                    Zoom -
                </Button>
            </div>

            {/* OBS: O Card/Popup de React (selectedPopup) foi **removido** pois o Leaflet usa seu próprio Popup de HTML. 
               O código foi movido para o 'popupContent' do marcador no useEffect.
               Manter o Card de React é complexo, pois ele não acompanha o movimento do mapa.
            */}
        </div>
    );
};

export default MapComponent;