const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Material = require('./models/Material');
const Enrollment = require('./models/Enrollment');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Module.deleteMany({});
    await Material.deleteMany({});
    await Enrollment.deleteMany({});

    console.log('🗑️  Existing data cleared');

    // Create demo users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const demoUser = await User.create({
      name: 'Student Demo',
      email: 'student@demo.com',
      password: hashedPassword,
      role: 'student',
      authProvider: 'local',
      isVerified: true,
      lastLogin: Date.now()
    });

    const adminUser = await User.create({
      name: 'Admin Demo',
      email: 'admin@demo.com',
      password: hashedPassword,
      role: 'admin',
      authProvider: 'local',
      isVerified: true,
      lastLogin: Date.now()
    });

    console.log('👤 Demo users created:');
    console.log(`   - Student: ${demoUser.email}`);
    console.log(`   - Admin: ${adminUser.email}`);

    // Create courses
    const courses = await Course.insertMany([
      {
        title: 'Matematika Dasar UTBK',
        description: 'Kuasai konsep dasar matematika untuk persiapan UTBK dengan pembahasan lengkap dan latihan soal',
        subject: 'Matematika',
        grade: '12',
        level: 'Beginner',
        totalModules: 8,
        totalDuration: '16 jam',
        enrolledCount: 1234,
        rating: 4.8,
        isPopular: true
      },
      {
        title: 'Fisika Mekanika',
        description: 'Pelajari hukum Newton, kinematika, dan dinamika dengan pendekatan praktis',
        subject: 'Fisika',
        grade: '12',
        level: 'Intermediate',
        totalModules: 6,
        totalDuration: '12 jam',
        enrolledCount: 856,
        rating: 4.7,
        isPopular: true
      },
      {
        title: 'Bahasa Indonesia: Teks & Literasi',
        description: 'Tingkatkan kemampuan literasi dan analisis teks untuk persiapan ujian',
        subject: 'Bahasa Indonesia',
        grade: '12',
        level: 'Beginner',
        totalModules: 5,
        totalDuration: '10 jam',
        enrolledCount: 2341,
        rating: 4.9,
        isPopular: true
      }
    ]);

    console.log(`📚 ${courses.length} courses created`);

    // Create modules and materials for each course
    for (const course of courses) {
      const modules = await Module.insertMany([
        {
          course: course._id,
          title: `Pengenalan ${course.subject}`,
          description: `Memahami konsep dasar ${course.subject}`,
          order: 1,
          content: `Materi pengenalan ${course.subject} lengkap untuk pemula. 
          Dalam modul ini, Anda akan mempelajari konsep-konsep fundamental yang menjadi dasar 
          pemahaman ${course.subject} secara keseluruhan.`,
          duration: '45 menit'
        },
        {
          course: course._id,
          title: `Konsep Dasar ${course.subject}`,
          description: `Pembahasan mendalam tentang konsep dasar`,
          order: 2,
          content: `Detail materi konsep dasar ${course.subject}...`,
          duration: '60 menit'
        },
        {
          course: course._id,
          title: `Latihan Soal ${course.subject}`,
          description: `Praktik mengerjakan soal-soal`,
          order: 3,
          content: `Kumpulan latihan soal dan pembahasan...`,
          duration: '90 menit'
        }
      ]);

      console.log(`📖 ${modules.length} modules created for ${course.title}`);

      // Create materials for each module
      for (const module of modules) {
        await Material.insertMany([
          {
            title: `Video: ${module.title}`,
            description: `Video pembelajaran interaktif tentang ${module.title}`,
            content: `Video pembelajaran ini membahas secara detail tentang ${module.title}...`,
            subject: course.subject,
            grade: course.grade,
            course: course._id,
            module: module._id,
            type: 'video',
            duration: '15 menit'
          },
          {
            title: `Artikel: ${module.title}`,
            description: `Materi bacaan lengkap tentang ${module.title}`,
            content: `Artikel ini berisi penjelasan komprehensif tentang ${module.title}...`,
            subject: course.subject,
            grade: course.grade,
            course: course._id,
            module: module._id,
            type: 'article',
            duration: '10 menit'
          }
        ]);
      }
    }

    // Enroll demo user in first course
    await Enrollment.create({
      user: demoUser._id,
      course: courses[0]._id,
      status: 'in-progress',
      progress: 45,
      completedModules: []
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n📝 Demo Credentials:');
    console.log('   Student: student@demo.com / 123456');
    console.log('   Admin: admin@demo.com / 123456');
    console.log('\n🎉 Seeding complete!');

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    mongoose.connection.close();
  }
};

seedDatabase();