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
  }[];
  formerStudents: {
    name: string;
    university: string;
    course: string;
    contact?: string;
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
      { name: 'Maria Santos', subject: 'Pedagogia', email: 'maria.santos@escola.ba.gov.br' },
      { name: 'João Silva', subject: 'História' },
      { name: 'Ana Costa', subject: 'Geografia' }
    ],
    formerStudents: [
      { name: 'Pedro Oliveira', university: 'UFBA', course: 'Pedagogia', contact: 'pedro.oliveira@email.com' },
      { name: 'Carla Mendes', university: 'UNEB', course: 'História' }
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
      { name: 'Lucia Ferreira', subject: 'Pedagogia' },
      { name: 'Roberto Lima', subject: 'Matemática' },
      { name: 'Sandra Pereira', subject: 'Português' }
    ],
    formerStudents: [
      { name: 'Julia Rocha', university: 'UFBA', course: 'Pedagogia' },
      { name: 'Marcos Souza', university: 'UNIFACS', course: 'Pedagogia' }
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
      { name: 'Patricia Alves', subject: 'Pedagogia' },
      { name: 'Carlos Reis', subject: 'Inglês' },
      { name: 'Monica Dias', subject: 'Artes' }
    ],
    formerStudents: [
      { name: 'Beatriz Campos', university: 'UFBA', course: 'Pedagogia' },
      { name: 'Lucas Andrade', university: 'PUC-SP', course: 'Pedagogia' }
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
      { name: 'Ricardo Barbosa', subject: 'História' },
      { name: 'Fernanda Nunes', subject: 'Sociologia' },
      { name: 'Gilberto Moura', subject: 'Filosofia' }
    ],
    formerStudents: [
      { name: 'Camila Torres', university: 'UNEB', course: 'História' },
      { name: 'Diego Santos', university: 'UFBA', course: 'Filosofia' }
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
      { name: 'Conceição Silva', subject: 'Pedagogia' },
      { name: 'Antonio Carlos', subject: 'Português' },
      { name: 'Mariana Costa', subject: 'Matemática' }
    ],
    formerStudents: [
      { name: 'Thiago Lima', university: 'UNEB', course: 'Pedagogia' },
      { name: 'Adriana Melo', university: 'UNIFACS', course: 'Letras' }
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
      { name: 'Helena Rocha', subject: 'Pedagogia' },
      { name: 'Fábio Mendes', subject: 'Música' },
      { name: 'Vera Cruz', subject: 'Artes' }
    ],
    formerStudents: [
      { name: 'Renata Oliveira', university: 'UFBA', course: 'Pedagogia' },
      { name: 'Gabriel Silva', university: 'UNIFACS', course: 'Música' }
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