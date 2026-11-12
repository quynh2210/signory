/**
 * SIGNORY Initial Seed Data
 * Contains fully functional lessons, questions, badges, and settings for both Parents and Kids modes.
 */

export const INITIAL_LESSONS = [
  // PARENTS MODE LESSONS
  {
    id: 'lesson-1-at-home',
    title: 'Bài 1: Ở nhà cùng bé',
    description: 'Làm quen với 3 ký hiệu quen thuộc nhất trong không gian gia đình: Nhà, Ăn và Ngủ.',
    mode: 'parents',
    topic: 'Ở nhà',
    order: 1,
    isPublished: true,
    isLockedByDefault: false,
    thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    rewardPoints: 50,
    signsCount: 3,
    estimatedMinutes: 3,
    signsList: ['Nhà', 'Ăn', 'Ngủ'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'lesson-2-family-love',
    title: 'Bài 2: Gia đình & Yêu thương',
    description: 'Học cách biểu đạt tình cảm thân thương với 3 ký hiệu: Ba, Mẹ và Yêu thương.',
    mode: 'parents',
    topic: 'Gia đình',
    order: 2,
    isPublished: true,
    isLockedByDefault: true,
    thumbnail: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=600&auto=format&fit=crop&q=80',
    rewardPoints: 60,
    signsCount: 3,
    estimatedMinutes: 3,
    signsList: ['Ba', 'Mẹ', 'Yêu thương'],
    createdAt: new Date().toISOString()
  },

  // KIDS MODE LESSONS (Structured progressive learning path for kids)
  {
    id: 'lesson-kids-1-home',
    title: 'Bài 1: Bé Khám Phá Mái Ấm',
    description: 'Bé học 3 ký hiệu thân thương trong ngôi nhà: Nhà, Ăn và Ngủ qua hình ảnh sinh động và tập ghép chữ.',
    mode: 'kids',
    topic: 'Mái ấm của bé',
    order: 1,
    isPublished: true,
    isLockedByDefault: false,
    thumbnail: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&auto=format&fit=crop&q=80',
    rewardPoints: 40,
    signsCount: 3,
    estimatedMinutes: 2,
    signsList: ['Nhà', 'Ăn', 'Ngủ'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'lesson-kids-2-family',
    title: 'Bài 2: Bé Yêu Ba Mẹ',
    description: 'Bé nhận biết ký hiệu Ba, Mẹ và Yêu thương, vừa chơi vừa học ghép chữ cái tiếng Việt.',
    mode: 'kids',
    topic: 'Gia đình yêu thương',
    order: 2,
    isPublished: true,
    isLockedByDefault: true,
    thumbnail: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80',
    rewardPoints: 50,
    signsCount: 3,
    estimatedMinutes: 2,
    signsList: ['Ba', 'Mẹ', 'Yêu thương'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'lesson-kids-daily-game',
    title: 'Trò Chơi Thử Thách 5 Câu Của Bé',
    description: 'Lượt chơi tổng hợp 5 câu đố vui nhộn giúp bé ôn tập và nhớ mặt chữ thật nhanh.',
    mode: 'kids',
    topic: 'Thử thách đố vui',
    order: 3,
    isPublished: true,
    isLockedByDefault: false,
    thumbnail: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&auto=format&fit=crop&q=80',
    rewardPoints: 40,
    signsCount: 5,
    estimatedMinutes: 3,
    signsList: ['Nhà', 'Ăn', 'Ngủ', 'Ba', 'Mẹ'],
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_BLOCKS = {
  // PARENTS LESSON 1
  'lesson-1-at-home': [
    {
      id: 'block-1-1',
      lessonId: 'lesson-1-at-home',
      type: 'text',
      order: 1,
      content: {
        title: 'Chào mừng gia đình đến với SIGNORY!',
        body: 'Trong bài học này, bố mẹ sẽ cùng bé làm quen với 3 ký hiệu cơ bản xuất hiện trong cuốn truyện tranh: **Nhà**, **Ăn**, và **Ngủ**. Hãy xem kỹ chuyển động của bàn tay và thực hành cùng bé nhé!',
        tip: 'Mẹo nhớ: Hãy làm điệu bộ vui vẻ để bé cảm nhận ngôn ngữ ký hiệu như một trò chơi thú vị!'
      }
    },
    {
      id: 'block-1-2',
      lessonId: 'lesson-1-at-home',
      type: 'video',
      order: 2,
      content: {
        title: 'Ký hiệu 1: NHÀ (Mái ấm gia đình)',
        description: 'Hai bàn tay chụm lại hình chữ V úp ngược trước ngực, tượng trưng cho mái nhà che chở.',
        mediaUrl: 'https://res.cloudinary.com/demo/video/upload/v1689845789/samples/cld-sample-video.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&auto=format&fit=crop&q=80',
        disclaimer: 'Video ký hiệu minh họa mẫu: Chụm các đầu ngón tay tạo hình tam giác mái nhà.'
      }
    },
    {
      id: 'block-1-3',
      lessonId: 'lesson-1-at-home',
      type: 'quiz',
      order: 3,
      quizRefId: 'q-1-1'
    },
    {
      id: 'block-1-4',
      lessonId: 'lesson-1-at-home',
      type: 'video',
      order: 4,
      content: {
        title: 'Ký hiệu 2: ĂN (Bữa cơm ngon miệng)',
        description: 'Các đầu ngón tay chụm lại hướng vào miệng, nhấp nhẹ 2 lần như động tác đưa thức ăn vào miệng.',
        mediaUrl: 'https://res.cloudinary.com/demo/video/upload/v1689845789/samples/cld-sample-video.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
        disclaimer: 'Video ký hiệu minh họa mẫu: Bàn tay chụm chấm nhẹ 2 lần gần miệng.'
      }
    },
    {
      id: 'block-1-5',
      lessonId: 'lesson-1-at-home',
      type: 'quiz',
      order: 5,
      quizRefId: 'q-1-2'
    },
    {
      id: 'block-1-6',
      lessonId: 'lesson-1-at-home',
      type: 'video',
      order: 6,
      content: {
        title: 'Ký hiệu 3: NGỦ (Giấc ngủ ngoan)',
        description: 'Hai lòng bàn tay áp vào nhau đặt nghiêng một bên má, đầu hơi nghiêng và mắt nhắm nhẹ.',
        mediaUrl: 'https://res.cloudinary.com/demo/video/upload/v1689845789/samples/cld-sample-video.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80',
        disclaimer: 'Video ký hiệu minh họa mẫu: Áp hai tay vào má nghiêng, mô phỏng gối ngủ.'
      }
    },
    {
      id: 'block-1-7',
      lessonId: 'lesson-1-at-home',
      type: 'quiz',
      order: 7,
      quizRefId: 'q-1-3'
    }
  ],

  // PARENTS LESSON 2
  'lesson-2-family-love': [
    {
      id: 'block-2-1',
      lessonId: 'lesson-2-family-love',
      type: 'text',
      order: 1,
      content: {
        title: 'Gia đình & Yêu thương',
        body: 'Trong bài này, chúng ta sẽ học 3 ký hiệu thiêng liêng: **Ba (Bố)**, **Mẹ** và **Yêu thương**. Đây là những từ bé thích dùng nhất mỗi ngày!',
        tip: 'Khi làm ký hiệu Yêu thương, hãy mỉm cười và ôm nhẹ để bé cảm nhận tình yêu chân thành!'
      }
    },
    {
      id: 'block-2-2',
      lessonId: 'lesson-2-family-love',
      type: 'video',
      order: 2,
      content: {
        title: 'Ký hiệu 1: BA / BỐ (Bờ vai vững chãi)',
        description: 'Ngón cái xòe ra chạm nhẹ vào trán (thể hiện vị trí cao, bờ vai vững chắc của người cha).',
        mediaUrl: 'https://res.cloudinary.com/demo/video/upload/v1689845789/samples/cld-sample-video.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80',
        disclaimer: 'Video ký hiệu minh họa mẫu: Chạm ngón tay cái lên trán.'
      }
    },
    {
      id: 'block-2-3',
      lessonId: 'lesson-2-family-love',
      type: 'quiz',
      order: 3,
      quizRefId: 'q-2-1'
    },
    {
      id: 'block-2-4',
      lessonId: 'lesson-2-family-love',
      type: 'video',
      order: 4,
      content: {
        title: 'Ký hiệu 2: MẸ (Dịu dàng yêu thương)',
        description: 'Ngón cái xòe ra chạm nhẹ vào cằm hoặc một bên má (biểu thị nét dịu dàng ấm áp của mẹ).',
        mediaUrl: 'https://res.cloudinary.com/demo/video/upload/v1689845789/samples/cld-sample-video.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        disclaimer: 'Video ký hiệu minh họa mẫu: Chạm ngón tay cái vào cằm.'
      }
    },
    {
      id: 'block-2-5',
      lessonId: 'lesson-2-family-love',
      type: 'video',
      order: 5,
      content: {
        title: 'Ký hiệu 3: YÊU THƯƠNG (Trái tim kết nối)',
        description: 'Hai tay nắm nhẹ bắt chéo trước ngực (như ôm lấy trái tim).',
        mediaUrl: 'https://res.cloudinary.com/demo/video/upload/v1689845789/samples/cld-sample-video.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop&q=80',
        disclaimer: 'Video ký hiệu minh họa mẫu: Hai tay bắt chéo ôm trước ngực.'
      }
    },
    {
      id: 'block-2-6',
      lessonId: 'lesson-2-family-love',
      type: 'quiz',
      order: 6,
      quizRefId: 'q-2-2'
    }
  ],

  // KIDS LESSON 1
  'lesson-kids-1-home': [
    {
      id: 'kb-1-1',
      lessonId: 'lesson-kids-1-home',
      type: 'text',
      order: 1,
      content: {
        title: 'Chào bé yêu đến với Mái Ấm!',
        body: 'Hôm nay bé hãy cùng khám phá 3 ký hiệu quen thuộc nhất ở nhà nhé: **Nhà**, **Ăn**, và **Ngủ**!',
        tip: 'Bé hãy nhìn kỹ chuyển động bàn tay và làm theo bố mẹ nhé!'
      }
    },
    {
      id: 'kb-1-2',
      lessonId: 'lesson-kids-1-home',
      type: 'video',
      order: 2,
      content: {
        title: 'Ký hiệu: NGÔI NHÀ',
        description: 'Hai bàn tay chụm lại làm mái nhà chữ V che chở cho bé!',
        mediaUrl: 'https://res.cloudinary.com/demo/video/upload/v1689845789/samples/cld-sample-video.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&auto=format&fit=crop&q=80',
        disclaimer: 'Ký hiệu Mái nhà: 2 bàn tay khép chụm trên cao.'
      }
    },
    {
      id: 'kb-1-3',
      lessonId: 'lesson-kids-1-home',
      type: 'quiz',
      order: 3,
      quizRefId: 'kids-q-1'
    },
    {
      id: 'kb-1-4',
      lessonId: 'lesson-kids-1-home',
      type: 'quiz',
      order: 4,
      quizRefId: 'kids-q-2'
    },
    {
      id: 'kb-1-5',
      lessonId: 'lesson-kids-1-home',
      type: 'quiz',
      order: 5,
      quizRefId: 'kids-q-3'
    }
  ],

  // KIDS LESSON 2
  'lesson-kids-2-family': [
    {
      id: 'kb-2-1',
      lessonId: 'lesson-kids-2-family',
      type: 'text',
      order: 1,
      content: {
        title: 'Bé Yêu Ba Mẹ!',
        body: 'Hôm nay bé hãy cùng học ký hiệu của những người yêu thương bé nhất: **Ba**, **Mẹ** và tình cảm **Yêu thương**!',
        tip: 'Làm xong ký hiệu, bé nhớ ôm ba mẹ thật chặt nhé!'
      }
    },
    {
      id: 'kb-2-2',
      lessonId: 'lesson-kids-2-family',
      type: 'video',
      order: 2,
      content: {
        title: 'Ký hiệu: BA & MẸ',
        description: 'Ngón tay chạm trán là Ba, chạm má dịu dàng là Mẹ hiền!',
        mediaUrl: 'https://res.cloudinary.com/demo/video/upload/v1689845789/samples/cld-sample-video.mp4',
        posterUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80',
        disclaimer: 'Ký hiệu Ba: Chạm trán. Ký hiệu Mẹ: Chạm cằm/má.'
      }
    },
    {
      id: 'kb-2-3',
      lessonId: 'lesson-kids-2-family',
      type: 'quiz',
      order: 3,
      quizRefId: 'kids-q-4'
    },
    {
      id: 'kb-2-4',
      lessonId: 'lesson-kids-2-family',
      type: 'quiz',
      order: 4,
      quizRefId: 'kids-q-5'
    }
  ],

  // KIDS DAILY 5-QUESTIONS GAME
  'lesson-kids-daily-game': [
    {
      id: 'kbg-1',
      lessonId: 'lesson-kids-daily-game',
      type: 'quiz',
      order: 1,
      quizRefId: 'kids-q-1'
    },
    {
      id: 'kbg-2',
      lessonId: 'lesson-kids-daily-game',
      type: 'quiz',
      order: 2,
      quizRefId: 'kids-q-2'
    },
    {
      id: 'kbg-3',
      lessonId: 'lesson-kids-daily-game',
      type: 'quiz',
      order: 3,
      quizRefId: 'kids-q-3'
    },
    {
      id: 'kbg-4',
      lessonId: 'lesson-kids-daily-game',
      type: 'quiz',
      order: 4,
      quizRefId: 'kids-q-4'
    },
    {
      id: 'kbg-5',
      lessonId: 'lesson-kids-daily-game',
      type: 'quiz',
      order: 5,
      quizRefId: 'kids-q-5'
    }
  ]
};

export const INITIAL_QUESTIONS = [
  // PARENTS QUESTIONS
  {
    id: 'q-1-1',
    lessonId: 'lesson-1-at-home',
    type: 'multiple-choice',
    questionTitle: 'Kiểm tra ký hiệu: Nhà',
    questionText: 'Hai bàn tay chụm lại hình chữ V úp ngược trước ngực có ý nghĩa là gì?',
    questionImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    answerOptions: [
      { id: 'opt-a', text: 'Nhà (Mái ấm gia đình)', isCorrect: true },
      { id: 'opt-b', text: 'Trường học', isCorrect: false },
      { id: 'opt-c', text: 'Ăn cơm', isCorrect: false },
      { id: 'opt-d', text: 'Đi chơi công viên', isCorrect: false }
    ],
    correctAnswer: 'opt-a',
    correctFeedback: 'Chính xác! Hai bàn tay chụm lại tượng trưng cho mái nhà che chở cả gia đình!',
    incorrectFeedback: 'Chưa đúng rồi! Hãy nhớ lại hình ảnh mái nhà chữ V úp ngược nhé.',
    explanation: 'Ký hiệu "Nhà" được thực hiện bằng cách chụm các đầu ngón tay tạo thành hình tam giác mái nhà.',
    points: 15,
    order: 1
  },
  {
    id: 'q-1-2',
    lessonId: 'lesson-1-at-home',
    type: 'word-arrangement',
    questionTitle: 'Sắp xếp câu: Diễn đạt bằng ký hiệu',
    questionText: 'Hãy ghép các từ sau để tạo thành câu hoàn chỉnh biểu thị hành động muốn dùng bữa:',
    words: ['TÔI', 'MUỐN', 'ĂN'],
    distractorWords: ['NGỦ', 'ĐI'],
    correctSequence: ['TÔI', 'MUỐN', 'ĂN'],
    correctFeedback: 'Tuyệt vời! Bé và phụ huynh có thể dùng ký hiệu này khi đến giờ cơm!',
    incorrectFeedback: 'Thử sắp xếp lại xem: Chủ ngữ "Tôi" -> Mong muốn -> Hành động "Ăn".',
    explanation: 'Câu "TÔI MUỐN ĂN" là một trong những câu giao tiếp thiết thực nhất trong gia đình.',
    points: 20,
    order: 2
  },
  {
    id: 'q-1-3',
    lessonId: 'lesson-1-at-home',
    type: 'matching',
    questionTitle: 'Nối ký hiệu với ý nghĩa tương ứng',
    questionText: 'Hãy ghép đôi động tác ký hiệu với ý nghĩa đúng của nó:',
    pairs: [
      { id: 'p1', left: 'Chụm 2 tay hình mái nhà chữ V', right: 'Nhà' },
      { id: 'p2', left: 'Chụm ngón tay chấm nhẹ ở miệng', right: 'Ăn' },
      { id: 'p3', left: 'Áp 2 bàn tay vào má nghiêng', right: 'Ngủ' }
    ],
    correctFeedback: 'Quá xuất sắc! Bạn đã ghi nhớ trọn vẹn cả 3 ký hiệu của Bài 1!',
    incorrectFeedback: 'Hãy kiểm tra lại một vài cặp chưa khớp nhé.',
    explanation: 'Cả 3 ký hiệu Nhà, Ăn và Ngủ đều có hình ảnh gợi nhớ rất gần gũi với cuộc sống hằng ngày.',
    points: 25,
    order: 3
  },
  {
    id: 'q-2-1',
    lessonId: 'lesson-2-family-love',
    type: 'true-false',
    questionTitle: 'Đúng hay Sai?',
    questionText: 'Ký hiệu "BA (BỐ)" được thực hiện bằng cách chạm ngón tay cái lên trán, đúng hay sai?',
    correctAnswer: 'true',
    correctFeedback: 'Chính xác! Trán biểu trưng cho sự che chở, bảo vệ vững vàng của người cha.',
    incorrectFeedback: 'Chưa chính xác! Trong ngôn ngữ ký hiệu, ngón tay cái chạm trán là ký hiệu BA.',
    explanation: 'Vị trí vùng trán thường được quy ước cho nam giới/người cha trong nhiều hệ thống ngôn ngữ ký hiệu.',
    points: 15,
    order: 1
  },
  {
    id: 'q-2-2',
    lessonId: 'lesson-2-family-love',
    type: 'video-recognition',
    questionTitle: 'Nhận diện ký hiệu qua video',
    questionText: 'Quan sát động tác hai tay bắt chéo ôm trước ngực và chọn ý nghĩa đúng:',
    questionVideo: 'https://res.cloudinary.com/demo/video/upload/v1689845789/samples/cld-sample-video.mp4',
    answerOptions: [
      { id: 'opt-2a', text: 'Yêu thương', isCorrect: true },
      { id: 'opt-2b', text: 'Tạm biệt', isCorrect: false },
      { id: 'opt-2c', text: 'Xin chào', isCorrect: false },
      { id: 'opt-2d', text: 'Cảm ơn', isCorrect: false }
    ],
    correctAnswer: 'opt-2a',
    correctFeedback: 'Rất tuyệt! Hai tay ôm trước ngực thể hiện sự ôm ấp và tình yêu thương dạt dào!',
    incorrectFeedback: 'Chưa đúng, động tác này ôm sát lồng ngực như một cái ôm ấm áp.',
    explanation: 'Ký hiệu "Yêu thương" thể hiện sự ấm áp, ôm lấy trái tim mình dành cho người đối diện.',
    points: 20,
    order: 2
  },

  // KIDS MODE QUESTIONS (With letter-by-letter spelling breakdown and friendly explanations)
  {
    id: 'kids-q-1',
    lessonId: 'lesson-kids-1-home',
    type: 'image-selection',
    questionTitle: 'Ký hiệu này là gì bé ơi?',
    questionText: 'Bé hãy nhìn bàn tay làm động tác mái nhà chụm lại nhé!',
    questionImage: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&auto=format&fit=crop&q=80',
    targetWord: 'NHÀ',
    letters: ['N', 'H', 'À'],
    answerOptions: [
      { id: 'k1-a', label: 'Ngôi nhà', imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&auto=format&fit=crop&q=80', isCorrect: true },
      { id: 'k1-b', label: 'Quả táo', imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80', isCorrect: false },
      { id: 'k1-c', label: 'Mèo con', imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=80', isCorrect: false },
      { id: 'k1-d', label: 'Xe hơi', imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&auto=format&fit=crop&q=80', isCorrect: false }
    ],
    correctAnswer: 'k1-a',
    correctFeedback: 'Hoan hô bé! Bé đoán đúng rồi: N – H – À!',
    incorrectFeedback: 'Chưa đúng rồi! Bé hãy tìm hình ngôi nhà có mái ngói đỏ xinh nhé!',
    explanation: 'Ký hiệu hai bàn tay khép tạo hình tam giác mái nhà che mưa che nắng.',
    points: 10,
    order: 1
  },
  {
    id: 'kids-q-2',
    lessonId: 'lesson-kids-1-home',
    type: 'image-selection',
    questionTitle: 'Bé đoán xem đây là hành động gì?',
    questionText: 'Đầu ngón tay chụm lại chấm nhẹ gần miệng xinh nào!',
    questionImage: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
    targetWord: 'ĂN',
    letters: ['Ă', 'N'],
    answerOptions: [
      { id: 'k2-a', label: 'Bé đi ngủ', imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&auto=format&fit=crop&q=80', isCorrect: false },
      { id: 'k2-b', label: 'Bé ăn cơm', imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400&auto=format&fit=crop&q=80', isCorrect: true },
      { id: 'k2-c', label: 'Đọc truyện', imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80', isCorrect: false },
      { id: 'k2-d', label: 'Bơi lội', imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&auto=format&fit=crop&q=80', isCorrect: false }
    ],
    correctAnswer: 'k2-b',
    correctFeedback: 'Giỏi quá! Bé nhớ chữ: Ă – N nhé!',
    incorrectFeedback: 'Chưa đúng rồi! Động tác đưa tay lên miệng là khi bé đói bụng đấy!',
    explanation: 'Ký hiệu ĂN mô phỏng cử chỉ đưa thìa cơm ngon vào miệng.',
    points: 10,
    order: 2
  },
  {
    id: 'kids-q-3',
    lessonId: 'lesson-kids-1-home',
    type: 'image-selection',
    questionTitle: 'Hai tay áp má nghiêng đầu là gì nào?',
    questionText: 'Bé nhắm mắt lại nằm ngoan trong nôi.',
    questionImage: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80',
    targetWord: 'NGỦ',
    letters: ['N', 'G', 'Ủ'],
    answerOptions: [
      { id: 'k3-a', label: 'Đi chơi', imageUrl: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=400&auto=format&fit=crop&q=80', isCorrect: false },
      { id: 'k3-b', label: 'Cười tươi', imageUrl: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400&auto=format&fit=crop&q=80', isCorrect: false },
      { id: 'k3-c', label: 'Bé ngủ ngon', imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&auto=format&fit=crop&q=80', isCorrect: true },
      { id: 'k3-d', label: 'Uống nước', imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80', isCorrect: false }
    ],
    correctAnswer: 'k3-c',
    correctFeedback: 'Tuyệt đỉnh! Cùng đánh vần nào: N – G – Ủ!',
    incorrectFeedback: 'Chưa đúng rồi, bé hãy nhìn bạn nhỏ đang ôm gối nhắm mắt ngủ ngoan nhé!',
    explanation: 'Áp hai tay vào má nghiêng là động tác mô phỏng gối ngủ êm ái.',
    points: 10,
    order: 3
  },
  {
    id: 'kids-q-4',
    lessonId: 'lesson-kids-2-family',
    type: 'image-selection',
    questionTitle: 'Ngón tay chạm trán vững vàng là ai?',
    questionText: 'Người luôn bế bé lên vai thật cao!',
    questionImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80',
    targetWord: 'BA',
    letters: ['B', 'A'],
    answerOptions: [
      { id: 'k4-a', label: 'Ba yêu quý', imageUrl: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&auto=format&fit=crop&q=80', isCorrect: true },
      { id: 'k4-b', label: 'Chú cún', imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&auto=format&fit=crop&q=80', isCorrect: false },
      { id: 'k4-c', label: 'Ngôi sao', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80', isCorrect: false },
      { id: 'k4-d', label: 'Bông hoa', imageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&auto=format&fit=crop&q=80', isCorrect: false }
    ],
    correctAnswer: 'k4-a',
    correctFeedback: 'Bé thông minh quá! Từ này là: B – A!',
    incorrectFeedback: 'Chưa đúng rồi, đây là người ba luôn che chở cho bé!',
    explanation: 'Chạm ngón tay lên trán là ký hiệu biểu thị người Ba vững chãi.',
    points: 10,
    order: 1
  },
  {
    id: 'kids-q-5',
    lessonId: 'lesson-kids-2-family',
    type: 'image-selection',
    questionTitle: 'Ngón tay chạm má dịu dàng là ai nhỉ?',
    questionText: 'Người hát ru bé ngủ và nấu cho bé ăn mỗi ngày.',
    questionImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    targetWord: 'MẸ',
    letters: ['M', 'Ẹ'],
    answerOptions: [
      { id: 'k5-a', label: 'Mặt trời', imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80', isCorrect: false },
      { id: 'k5-b', label: 'Mẹ hiền', imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80', isCorrect: true },
      { id: 'k5-c', label: 'Búp bê', imageUrl: 'https://images.unsplash.com/photo-1581557991964-125469da3b8a?w=400&auto=format&fit=crop&q=80', isCorrect: false },
      { id: 'k5-d', label: 'Kem ngọt', imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&auto=format&fit=crop&q=80', isCorrect: false }
    ],
    correctAnswer: 'k5-b',
    correctFeedback: 'Tuyệt vời ông mặt trời! Bé đã hoàn thành xuất sắc: M – Ẹ!',
    incorrectFeedback: 'Chưa đúng rồi! Bé hãy tìm hình ảnh người mẹ dịu dàng nhé!',
    explanation: 'Chạm ngón tay vào cằm hoặc má là ký hiệu biểu thị người Mẹ.',
    points: 10,
    order: 2
  }
];

export const INITIAL_BADGES = [
  {
    id: 'badge-starter',
    name: 'Người Tiên Phong',
    description: 'Bắt đầu hành trình học ngôn ngữ ký hiệu cùng SIGNORY.',
    imageUrl: 'https://api.iconify.design/noto:party-popper.svg',
    pointsBonus: 20,
    condition: 'Đăng ký tài khoản và hoàn thành 1 câu hỏi đầu tiên'
  },
  {
    id: 'badge-first-lesson',
    name: 'Chinh Phục Mái Ấm',
    description: 'Hoàn thành trọn vẹn bài học "Ở nhà cùng bé".',
    imageUrl: 'https://api.iconify.design/noto:house-with-garden.svg',
    pointsBonus: 50,
    condition: 'Hoàn thành Bài 1'
  },
  {
    id: 'badge-three-stars',
    name: 'Bậc Thầy 3 Sao',
    description: 'Đạt điểm tuyệt đối 3 sao trong bất kỳ bài học nào.',
    imageUrl: 'https://api.iconify.design/noto:glowing-star.svg',
    pointsBonus: 30,
    condition: 'Đạt 3 sao trong một bài học'
  },
  {
    id: 'badge-kids-hero',
    name: 'Bé Thông Thái',
    description: 'Hoàn thành xuất sắc 5 câu hỏi ghép hình và chữ cái ở Chế độ Bé.',
    imageUrl: 'https://api.iconify.design/noto:smiling-face-with-sunglasses.svg',
    pointsBonus: 40,
    condition: 'Hoàn thành 1 lượt chơi Chế độ Bé'
  },
  {
    id: 'badge-daily-streak',
    name: 'Gia Đình Gắn Kết',
    description: 'Hoàn thành cả 2 chủ đề Ở Nhà và Gia Đình Yêu Thương.',
    imageUrl: 'https://api.iconify.design/noto:red-heart.svg',
    pointsBonus: 100,
    condition: 'Hoàn thành bài 1 và bài 2'
  }
];

export const INITIAL_APP_SETTINGS = {
  soundEffects: true,
  defaultVolume: 0.7,
  dailyGoalExp: 30,
  questionsPerKidGame: 5,
  sampleDataNotice: 'Dữ liệu mẫu ban đầu phục vụ kiểm thử hệ thống. Video và hình ảnh thực tế cần được kiểm duyệt bởi chuyên gia ngôn ngữ ký hiệu.'
};
