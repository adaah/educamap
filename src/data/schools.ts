export interface School {
  id: string;
  name: string;
  neighborhood: string;
  fullAddress: string;
  coordinates: [number, number]; // [longitude, latitude]
  email?: string;
  phone?: string;
  website?: string;
  nature: 'Pública' | 'Particular';
  periods: string[];
  subjects: string[];
  shift: string[];
  instructors: {
    name: string;
    subject: string;
    email?: string;
    linkedin?: string;
    whatsapp?: string;
    instagram?: string;
  }[];
  formerStudents: {
    name: string;
    university: string;
    course: string;
    email?: string;
    linkedin?: string;
    instagram?: string;
    whatsapp?: string;
  }[];
}

export const mockSchools: School[] = [
  {
    id: '1',
    name: 'Colégio Estadual Luiz Viana Filho',
    neighborhood: 'Paralela',
    fullAddress: 'Rua da Paralela, 1234 - Paralela, Salvador - BA',
    coordinates: [-38.4663, -12.9855],
    email: 'luizviana@educacao.ba.gov.br',
    phone: '(71) 3234-5678',
    nature: 'Pública',
    periods: ['Ensino Fundamental II', 'Ensino Médio'],
    subjects: ['Pedagogia', 'História', 'Geografia', 'Português'],
    shift: ['Matutino', 'Vespertino'],
    instructors: [
      { name: 'Maria Santos', subject: 'Pedagogia', email: 'maria.santos@escola.ba.gov.br', linkedin: 'https://linkedin.com/in/maria-santos' },
      { name: 'João Silva', subject: 'História', whatsapp: '+5571987654321' },
      { name: 'Ana Costa', subject: 'Geografia', email: 'ana.costa@escola.ba.gov.br' }
    ],
    formerStudents: [
      { name: 'Pedro Oliveira', university: 'UFBA', course: 'Pedagogia', email: 'pedro.oliveira@email.com', linkedin: 'https://linkedin.com/in/pedro-oliveira' },
      { name: 'Carla Mendes', university: 'UNEB', course: 'História', instagram: 'https://instagram.com/carla.mendes', whatsapp: '+5571988765432' }
    ]
  },
  {
    id: '2',
    name: 'Escola Municipal Anísio Teixeira',
    neighborhood: 'Brotas',
    fullAddress: 'Av. Anísio Teixeira, 567 - Brotas, Salvador - BA',
    coordinates: [-38.5108, -12.9777],
    email: 'anisio@educacao.salvador.ba.gov.br',
    phone: '(71) 3345-6789',
    nature: 'Pública',
    periods: ['Ensino Fundamental I', 'Ensino Fundamental II'],
    subjects: ['Pedagogia', 'Matemática', 'Português', 'Ciências'],
    shift: ['Matutino', 'Vespertino'],
    instructors: [
      { name: 'Lucia Ferreira', subject: 'Pedagogia', email: 'lucia.ferreira@salvador.ba.gov.br' },
      { name: 'Roberto Lima', subject: 'Matemática', linkedin: 'https://linkedin.com/in/roberto-lima', whatsapp: '+5571987123456' },
      { name: 'Sandra Pereira', subject: 'Português', email: 'sandra.pereira@salvador.ba.gov.br' }
    ],
    formerStudents: [
      { name: 'Julia Rocha', university: 'UFBA', course: 'Pedagogia', email: 'julia.rocha@email.com', instagram: 'https://instagram.com/julia.rocha' },
      { name: 'Marcos Souza', university: 'UNIFACS', course: 'Pedagogia', linkedin: 'https://linkedin.com/in/marcos-souza' }
    ]
  },
  {
    id: '3',
    name: 'Colégio Particular Santa Clara',
    neighborhood: 'Barra',
    fullAddress: 'Rua Santa Clara, 890 - Barra, Salvador - BA',
    coordinates: [-38.5205, -13.0093],
    email: 'contato@santaclara.edu.br',
    phone: '(71) 3456-7890',
    website: 'www.santaclara.edu.br',
    nature: 'Particular',
    periods: ['Educação Infantil', 'Ensino Fundamental I', 'Ensino Fundamental II', 'Ensino Médio'],
    subjects: ['Pedagogia', 'Inglês', 'Artes', 'Educação Física'],
    shift: ['Matutino', 'Vespertino', 'Integral'],
    instructors: [
      { name: 'Patricia Alves', subject: 'Pedagogia', email: 'patricia@santaclara.edu.br', linkedin: 'https://linkedin.com/in/patricia-alves' },
      { name: 'Carlos Reis', subject: 'Inglês', whatsapp: '+5571987987654' },
      { name: 'Monica Dias', subject: 'Artes', email: 'monica@santaclara.edu.br', instagram: 'https://instagram.com/monica.dias.arte' }
    ],
    formerStudents: [
      { name: 'Beatriz Campos', university: 'UFBA', course: 'Pedagogia', email: 'beatriz.campos@email.com', linkedin: 'https://linkedin.com/in/beatriz-campos' },
      { name: 'Lucas Andrade', university: 'PUC-SP', course: 'Pedagogia', whatsapp: '+5571988234567', instagram: 'https://instagram.com/lucas.andrade' }
    ]
  },
  {
    id: '4',
    name: 'Centro Educacional Odorico Tavares',
    neighborhood: 'Itapuã',
    fullAddress: 'Rua Odorico Tavares, 456 - Itapuã, Salvador - BA',
    coordinates: [-38.3486, -12.9416],
    email: 'odorico@educacao.ba.gov.br',
    phone: '(71) 3567-8901',
    nature: 'Pública',
    periods: ['Ensino Fundamental II', 'Ensino Médio'],
    subjects: ['História', 'Sociologia', 'Filosofia', 'Literatura'],
    shift: ['Matutino', 'Vespertino', 'Noturno'],
    instructors: [
      { name: 'Ricardo Barbosa', subject: 'História', email: 'ricardo.barbosa@educacao.ba.gov.br' },
      { name: 'Fernanda Nunes', subject: 'Sociologia', linkedin: 'https://linkedin.com/in/fernanda-nunes', whatsapp: '+5571987345678' },
      { name: 'Gilberto Moura', subject: 'Filosofia', email: 'gilberto.moura@educacao.ba.gov.br' }
    ],
    formerStudents: [
      { name: 'Camila Torres', university: 'UNEB', course: 'História', email: 'camila.torres@email.com', instagram: 'https://instagram.com/camila.torres' },
      { name: 'Diego Santos', university: 'UFBA', course: 'Filosofia', linkedin: 'https://linkedin.com/in/diego-santos', whatsapp: '+5571988876543' }
    ]
  },
  {
    id: '5',
    name: 'Escola Estadual Paulo Freire',
    neighborhood: 'Liberdade',
    fullAddress: 'Largo do Curuzu, 123 - Liberdade, Salvador - BA',
    coordinates: [-38.5000, -12.9400],
    email: 'paulofreire@educacao.ba.gov.br',
    phone: '(71) 3678-9012',
    nature: 'Pública',
    periods: ['Ensino Fundamental I', 'Ensino Fundamental II'],
    subjects: ['Pedagogia', 'Português', 'Matemática', 'História'],
    shift: ['Matutino', 'Vespertino'],
    instructors: [
      { name: 'Conceição Silva', subject: 'Pedagogia', email: 'conceicao.silva@educacao.ba.gov.br', whatsapp: '+5571987456789' },
      { name: 'Antonio Carlos', subject: 'Português', linkedin: 'https://linkedin.com/in/antonio-carlos' },
      { name: 'Mariana Costa', subject: 'Matemática', email: 'mariana.costa@educacao.ba.gov.br' }
    ],
    formerStudents: [
      { name: 'Thiago Lima', university: 'UNEB', course: 'Pedagogia', email: 'thiago.lima@email.com', linkedin: 'https://linkedin.com/in/thiago-lima' },
      { name: 'Adriana Melo', university: 'UNIFACS', course: 'Letras', instagram: 'https://instagram.com/adriana.melo', whatsapp: '+5571988567890' }
    ]
  },
  {
    id: '6',
    name: 'Colégio Particular Villa Lobos',
    neighborhood: 'Ondina',
    fullAddress: 'Av. Oceânica, 2345 - Ondina, Salvador - BA',
    coordinates: [-38.5150, -13.0050],
    email: 'secretaria@villalobos.com.br',
    phone: '(71) 3789-0123',
    website: 'www.villalobos.com.br',
    nature: 'Particular',
    periods: ['Educação Infantil', 'Ensino Fundamental I', 'Ensino Fundamental II'],
    subjects: ['Pedagogia', 'Música', 'Artes', 'Educação Física'],
    shift: ['Matutino', 'Vespertino'],
    instructors: [
      { name: 'Helena Rocha', subject: 'Pedagogia', email: 'helena@villalobos.com.br', linkedin: 'https://linkedin.com/in/helena-rocha' },
      { name: 'Fábio Mendes', subject: 'Música', whatsapp: '+5571987678901', instagram: 'https://instagram.com/fabio.musica' },
      { name: 'Vera Cruz', subject: 'Artes', email: 'vera@villalobos.com.br' }
    ],
    formerStudents: [
      { name: 'Renata Oliveira', university: 'UFBA', course: 'Pedagogia', email: 'renata.oliveira@email.com', linkedin: 'https://linkedin.com/in/renata-oliveira' },
      { name: 'Gabriel Silva', university: 'UNIFACS', course: 'Música', whatsapp: '+5571988789012', instagram: 'https://instagram.com/gabriel.musica' }
    ]
  }
];

export const neighborhoods = [
  'Paralela', 'Brotas', 'Barra', 'Itapuã', 'Liberdade', 'Ondina',
  'Campo Grande', 'Pituba', 'Rio Vermelho', 'Federação', 'Graça',
  'Vitória', 'Pelourinho', 'Comércio', 'Nazaré', 'Barris'
];

export const subjects = [
  'Pedagogia', 'História', 'Geografia', 'Português', 'Matemática',
  'Ciências', 'Inglês', 'Artes', 'Educação Física', 'Música',
  'Sociologia', 'Filosofia', 'Literatura', 'Química', 'Física'
];

export const periods = [
  'Educação Infantil',
  'Ensino Fundamental I',
  'Ensino Fundamental II',
  'Ensino Médio'
];

export const shifts = ['Matutino', 'Vespertino', 'Noturno', 'Integral'];

export const natures = ['Pública', 'Particular'];