import { useEffect, useRef, useState } from 'react';
// IMPORTANTE: Trocando Mapbox por Leaflet
import L, { Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Importa o CSS do Leaflet

import { type School } from '@/data/schools';
import { useSchools } from '@/hooks/useSchools';
import { useNavigate } from 'react-router-dom';
import { MapSearch } from './MapSearch';

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
    const map = useRef<LeafletMap | null>(null); 
    const [selectedPopup, setSelectedPopup] = useState<School | null>(null);
    const navigate = useNavigate();
    const { data: schools = [], isLoading } = useSchools();

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

        // 3. Criar ícones customizados para as escolas
        const createCustomIcon = (school: any) => {
            const color = school.nature === 'Pública' ? '#FFC700' : '#ff9900'; // Yellow for public, orange for private
            
            return L.divIcon({
                className: 'custom-pin',
                html: `
                    <div style="
                        width: 30px;
                        height: 30px;
                        background-color: ${color};
                        border: 3px solid white;
                        border-radius: 50%;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                    ">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                    </div>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -15]
            });
        };

        // 4. Adiciona marcadores para as escolas
        schools.forEach((school) => {
            // Leaflet usa [latitude, longitude], então invertemos as coordenadas
            const latLng: [number, number] = [school.coordinates[1], school.coordinates[0]];
            
            // Cria um marcador com ícone customizado
            const marker = L.marker(latLng, {
                icon: createCustomIcon(school)
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
                            <span>${school.periods.length > 0 ? school.periods.slice(0, 2).join(', ') : 'Sem informações de períodos'}</span>
                        </div>
                        <div class="text-sm">
                            <div class="font-semibold" style="color: #FF8C00;">Professores Instrutores:</div>
                            <div class="text-xs max-h-12 overflow-y-auto pl-4">
                                ${school.instructors.length > 0 ? school.instructors.map(i => `<div>${i.name} - ${i.subject}</div>`).join('') : '<div style="color: #888;">Sem informações de instrutores</div>'}
                            </div>
                        </div>
                        <div class="text-xs" style="color: #888;">
                            ${school.email ? `<div>Email: ${school.email}</div>` : '<div>Sem informações de contato</div>'}
                            ${school.phone ? `<div>Tel: ${school.phone}</div>` : ''}
                        </div>
                    </div>
                    <button id="details-btn-${school.id}" class="w-full px-3 py-2 rounded-lg font-poppins font-semibold" style="background: linear-gradient(to right, #FF8C00, #FFC700); color: #fff; border: none; cursor: pointer; transition: all 0.3s;">
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
    }, [schools, onSchoolSelect, navigate]);

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
    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="font-montserrat text-muted-foreground">Carregando escolas...</p>
            </div>
        );
    }

    const handleSchoolSearch = (school: School) => {
        if (map.current) {
            // Leaflet usa [latitude, longitude]
            const latLng: [number, number] = [school.coordinates[1], school.coordinates[0]];
            map.current.setView(latLng, 16);
        }
        onSchoolSelect?.(school);
        setSelectedPopup(school);
    };

    return (
        <div className="relative w-full h-full">
            {/* Contêiner REAL do Mapa Leaflet */}
            <div 
                ref={mapContainer} 
                id="leaflet-map-container"
                className="w-full h-full relative z-0"
            >
                {/* Aqui será onde o Leaflet injetará o mapa */}
            </div>

            {/* Map Search Bar - No canto direito */}
            <div className="absolute top-4 right-4 z-10">
                <MapSearch 
                    schools={schools}
                    onSchoolSelect={handleSchoolSearch}
                />
            </div>

            {/* Map Controls removed as requested - using native Leaflet controls */}

            {/* OBS: O Card/Popup de React (selectedPopup) foi **removido** pois o Leaflet usa seu próprio Popup de HTML. 
               O código foi movido para o 'popupContent' do marcador no useEffect.
               Manter o Card de React é complexo, pois ele não acompanha o movimento do mapa.
            */}
        </div>
    );
};

export default MapComponent;