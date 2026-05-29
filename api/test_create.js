const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    await prisma.entry.create({
      data: {
        entry: 'teste',
        languageCode: '',
        pronunciation: '',
        syllabicDivision: '',
        etymology: '',
        grammaticalCategory: '',
        grammaticalSubcategory: '',
        grammaticalStatus: '',
        firstDefinition: 'teste',
        secondDefinition: '',
        thirdDefinition: '',
        usageExample: '',
        abbreviation: '',
        acronym: '',
        acronymMeaning: '',
        reduction: '',
        reductionMeaning: '',
        shortForm: '',
        fullForm: '',
        isVocabulary: true,
        isForeignism: false,
        createdBy: { connect: { id: '895cd049-be32-4e63-a74a-b287f26c2506' } },
        approvalStatus: 'DRAFT'
      }
    });
    console.log('success');
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
