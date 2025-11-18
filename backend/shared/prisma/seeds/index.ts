/**
 * Master Seed Script
 * Generates realistic sample data for Financial Analytics Dashboard
 * - 3 Facilities (Hospital, Clinic, Small Hospital)
 * - 5-6 Departments per facility
 * - 6 Payer types
 * - 6 months of historical claims data (~50,000 records)
 * - 4 Demo user accounts
 */

import { PrismaClient, FacilityType, PayerType, ClaimStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomElement<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

function generateClaimNumber(): string {
  return `CLM-${Date.now()}-${randomInt(1000, 9999)}`;
}

// ============================================================================
// SEED DATA DEFINITIONS
// ============================================================================

const FACILITIES = [
  {
    name: 'General Medical Center',
    type: FacilityType.HOSPITAL,
    bedCount: 250,
    address: '123 Healthcare Ave',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
  },
  {
    name: 'Downtown Clinic',
    type: FacilityType.CLINIC,
    bedCount: null,
    address: '456 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94103',
  },
  {
    name: 'Riverside Hospital',
    type: FacilityType.HOSPITAL,
    bedCount: 75,
    address: '789 River Road',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94601',
  },
];

const DEPARTMENTS = [
  { name: 'Emergency Department', specialty: 'Emergency Medicine' },
  { name: 'Cardiology', specialty: 'Cardiovascular' },
  { name: 'Orthopedics', specialty: 'Musculoskeletal' },
  { name: 'Primary Care', specialty: 'Family Medicine' },
  { name: 'Radiology', specialty: 'Imaging' },
  { name: 'Surgery', specialty: 'General Surgery' },
];

const PAYERS = [
  { name: 'Medicare', type: PayerType.MEDICARE, contractRate: 0.75, averageDaysToPay: 35 },
  { name: 'Medicaid', type: PayerType.MEDICAID, contractRate: 0.65, averageDaysToPay: 42 },
  { name: 'Blue Cross Blue Shield', type: PayerType.BLUE_CROSS_BLUE_SHIELD, contractRate: 0.80, averageDaysToPay: 28 },
  { name: 'Aetna', type: PayerType.AETNA, contractRate: 0.78, averageDaysToPay: 30 },
  { name: 'UnitedHealthcare', type: PayerType.UNITED_HEALTHCARE, contractRate: 0.82, averageDaysToPay: 25 },
  { name: 'Self-Pay', type: PayerType.SELF_PAY, contractRate: 0.40, averageDaysToPay: 60 },
];

const DEMO_USERS = [
  {
    email: 'admin@healthcare.com',
    password: 'Admin@2024',
    name: 'Admin User',
    role: UserRole.ADMIN,
    facilityAccess: [],
  },
  {
    email: 'executive@healthcare.com',
    password: 'Exec@2024',
    name: 'Executive User',
    role: UserRole.EXECUTIVE,
    facilityAccess: [],
  },
  {
    email: 'analyst@healthcare.com',
    password: 'Analyst@2024',
    name: 'Data Analyst',
    role: UserRole.ANALYST,
    facilityAccess: [],
  },
  {
    email: 'manager@healthcare.com',
    password: 'Manager@2024',
    name: 'Facility Manager',
    role: UserRole.FACILITY_MANAGER,
    facilityAccess: [], // Will be set to first facility
  },
];

const SERVICE_TYPES = [
  'Office Visit',
  'Emergency Visit',
  'Inpatient Stay',
  'Surgery',
  'Diagnostic Test',
  'Lab Work',
  'Imaging',
  'Physical Therapy',
  'Consultation',
];

const DIAGNOSIS_CODES = [
  'I10 - Essential Hypertension',
  'E11.9 - Type 2 Diabetes',
  'J44.9 - COPD',
  'M54.5 - Low Back Pain',
  'R07.9 - Chest Pain',
  'N39.0 - UTI',
  'K21.9 - GERD',
  'F41.9 - Anxiety',
];

const PROCEDURE_CODES = [
  '99213 - Office Visit Level 3',
  '99214 - Office Visit Level 4',
  '99285 - Emergency Visit High',
  '70450 - CT Head',
  '93000 - ECG',
  '80053 - Comprehensive Metabolic Panel',
  '85025 - Complete Blood Count',
  '99223 - Initial Hospital Care',
];

const DENIAL_REASONS = [
  'Missing Authorization',
  'Coding Error',
  'Duplicate Claim',
  'Non-Covered Service',
  'Timely Filing Limit',
  'Missing Information',
  'Medical Necessity',
];

const PATIENT_FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
];

const PATIENT_LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedUsers() {
  console.log('🔐 Seeding users...');

  for (const user of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 12);

    await prisma.user.create({
      data: {
        email: user.email,
        passwordHash,
        name: user.name,
        role: user.role,
        facilityAccess: user.facilityAccess,
        isActive: true,
        emailVerified: true,
      },
    });
  }

  console.log(`✅ Created ${DEMO_USERS.length} users`);
}

async function seedFacilities() {
  console.log('🏥 Seeding facilities...');

  for (const facility of FACILITIES) {
    await prisma.facility.create({
      data: facility,
    });
  }

  console.log(`✅ Created ${FACILITIES.length} facilities`);
}

async function seedDepartments() {
  console.log('🏢 Seeding departments...');

  const facilities = await prisma.facility.findMany();
  let totalDepartments = 0;

  for (const facility of facilities) {
    // Hospitals get all departments, clinics get fewer
    const departmentsToAdd = facility.type === FacilityType.HOSPITAL
      ? DEPARTMENTS
      : DEPARTMENTS.slice(0, 4);

    for (const dept of departmentsToAdd) {
      await prisma.department.create({
        data: {
          ...dept,
          facilityId: facility.id,
        },
      });
      totalDepartments++;
    }
  }

  console.log(`✅ Created ${totalDepartments} departments`);
}

async function seedPayers() {
  console.log('💳 Seeding payers...');

  for (const payer of PAYERS) {
    await prisma.payer.create({
      data: payer,
    });
  }

  console.log(`✅ Created ${PAYERS.length} payers`);
}

async function seedClaims() {
  console.log('📋 Seeding claims (this may take a minute)...');

  const facilities = await prisma.facility.findMany({
    include: { departments: true },
  });
  const payers = await prisma.payer.findMany();

  // Date range: 6 months of data
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  // Target: ~150-300 claims per day across all facilities
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const claimsPerDay = 200;
  const totalClaims = totalDays * claimsPerDay;

  console.log(`   Generating ${totalClaims} claims over ${totalDays} days...`);

  const claims = [];
  let claimCount = 0;

  for (let i = 0; i < totalClaims; i++) {
    const facility = randomElement(facilities);
    const department = randomElement(facility.departments);
    const payer = randomElement(payers);

    // Service date within the 6-month window
    const serviceDate = randomDate(startDate, endDate);

    // Gross amount varies by service type and facility
    const baseAmount = facility.type === FacilityType.HOSPITAL
      ? randomFloat(500, 15000)
      : randomFloat(100, 2000);

    const grossAmount = baseAmount;

    // Contractual adjustment based on payer
    const adjustmentAmount = grossAmount * (1 - (payer.contractRate || 0.75));
    const netAmount = grossAmount - adjustmentAmount;

    // Determine claim status
    const statusRoll = Math.random();
    let status: ClaimStatus;
    let paymentAmount = 0;
    let paymentDate: Date | null = null;
    let denialReason: string | null = null;

    if (statusRoll < 0.75) {
      // 75% paid
      status = ClaimStatus.PAID;
      paymentAmount = netAmount;
      paymentDate = new Date(serviceDate);
      paymentDate.setDate(paymentDate.getDate() + randomInt(15, payer.averageDaysToPay || 30));
    } else if (statusRoll < 0.85) {
      // 10% partial payment
      status = ClaimStatus.PARTIAL_PAYMENT;
      paymentAmount = netAmount * randomFloat(0.5, 0.9);
      paymentDate = new Date(serviceDate);
      paymentDate.setDate(paymentDate.getDate() + randomInt(20, 45));
    } else if (statusRoll < 0.93) {
      // 8% denied
      status = ClaimStatus.DENIED;
      denialReason = randomElement(DENIAL_REASONS);
    } else {
      // 7% still in process
      const roll = Math.random();
      if (roll < 0.5) {
        status = ClaimStatus.SUBMITTED;
      } else if (roll < 0.8) {
        status = ClaimStatus.ACCEPTED;
      } else {
        status = ClaimStatus.APPEALED;
        denialReason = randomElement(DENIAL_REASONS);
      }
    }

    const outstandingAmount = netAmount - paymentAmount;

    // Generate patient name
    const patientFirstName = randomElement(PATIENT_FIRST_NAMES);
    const patientLastName = randomElement(PATIENT_LAST_NAMES);
    const patientName = `${patientFirstName} ${patientLastName}`;
    const patientId = `PT-${randomInt(10000, 99999)}`;

    // Submission date (2-5 days after service)
    const submissionDate = new Date(serviceDate);
    submissionDate.setDate(submissionDate.getDate() + randomInt(2, 5));

    // Adjudication date (10-20 days after submission)
    const adjudicationDate = new Date(submissionDate);
    adjudicationDate.setDate(adjudicationDate.getDate() + randomInt(10, 20));

    claims.push({
      facilityId: facility.id,
      departmentId: department.id,
      payerId: payer.id,
      patientId,
      patientName,
      patientDOB: randomDate(new Date('1940-01-01'), new Date('2010-01-01')),
      claimNumber: generateClaimNumber(),
      serviceDate,
      submissionDate,
      adjudicationDate: status !== ClaimStatus.DRAFT ? adjudicationDate : null,
      paymentDate,
      grossAmount,
      adjustmentAmount,
      netAmount,
      paymentAmount,
      outstandingAmount,
      status,
      denialReason,
      serviceType: randomElement(SERVICE_TYPES),
      diagnosisCode: randomElement(DIAGNOSIS_CODES),
      procedureCode: randomElement(PROCEDURE_CODES),
      units: randomInt(1, 3),
    });

    claimCount++;

    // Batch insert every 1000 claims for performance
    if (claims.length >= 1000) {
      await prisma.claim.createMany({
        data: claims,
        skipDuplicates: true,
      });
      console.log(`   Progress: ${claimCount}/${totalClaims} claims created...`);
      claims.length = 0; // Clear array
    }
  }

  // Insert remaining claims
  if (claims.length > 0) {
    await prisma.claim.createMany({
      data: claims,
      skipDuplicates: true,
    });
  }

  console.log(`✅ Created ${totalClaims} claims`);
}

async function updateUserFacilityAccess() {
  console.log('🔗 Updating facility manager access...');

  const facilities = await prisma.facility.findMany();
  const managerUser = await prisma.user.findFirst({
    where: { role: UserRole.FACILITY_MANAGER },
  });

  if (managerUser && facilities.length > 0) {
    await prisma.user.update({
      where: { id: managerUser.id },
      data: {
        facilityAccess: [facilities[0].id],
      },
    });
    console.log('✅ Updated facility manager access');
  }
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  console.log('\n🌱 Starting database seed...\n');

  try {
    // Clear existing data (in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🗑️  Clearing existing data...');
      await prisma.claim.deleteMany();
      await prisma.department.deleteMany();
      await prisma.payer.deleteMany();
      await prisma.facility.deleteMany();
      await prisma.refreshToken.deleteMany();
      await prisma.user.deleteMany();
      await prisma.kPISnapshot.deleteMany();
      await prisma.alert.deleteMany();
      await prisma.auditLog.deleteMany();
      await prisma.scheduledReport.deleteMany();
      console.log('✅ Cleared existing data\n');
    }

    // Seed in order (respecting foreign key constraints)
    await seedUsers();
    await seedFacilities();
    await seedDepartments();
    await seedPayers();
    await seedClaims();
    await updateUserFacilityAccess();

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${DEMO_USERS.length}`);
    console.log(`   - Facilities: ${FACILITIES.length}`);
    console.log(`   - Payers: ${PAYERS.length}`);

    const claimCount = await prisma.claim.count();
    console.log(`   - Claims: ${claimCount.toLocaleString()}`);

    console.log('\n🔐 Demo Credentials:');
    DEMO_USERS.forEach(user => {
      console.log(`   ${user.role}: ${user.email} / ${user.password}`);
    });

    console.log('\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute seed
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
