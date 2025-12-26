import 'dotenv/config';
import prisma from './lib/prisma';
import registerHandler from './api/auth/register';
import loginHandler from './api/auth/login';
import logoutHandler from './api/auth/logout';

// Mock vercel request / response
const createMockReq = (method: string, body: object = {}) => {
    return {
        method,
        body
    } as any;
};

const createMockRes = () => {
    const res: any = {
        statusCode: 200,
        data: null,
        status(code: number) {
            this.statusCode = code;
            return this;
        },
        json(data: any) {
            this.data = data;
            return this;
        }
    };
    return res;
};


const TEST_USER = {
    email: 'test@example.com',
    username: 'testUser',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
};

const cleanup = async () => {
    // delete test user if exists
    await prisma.user.deleteMany({
        where: { email: TEST_USER.email }
    });

    console.log('Cleaned up test data');
};

const testRegister = async () => {
    console.log('\n Testing Registration...');

    const req = createMockReq('POST', {
        email: TEST_USER.email,
        username: TEST_USER.username,
        password: TEST_USER.password,
        firstName: TEST_USER.firstName,
        lastName: TEST_USER.lastName
    });

    const res = createMockRes();

    await registerHandler(req, res);

    if (res.statusCode === 201) {
        console.log('Registration successful: ', res.data.user);
        console.log('Token received: ', res.data.token.substring(0, 50) + '...');
        return res.data;
    } else {
        console.log('Registration failed: ', res.statusCode, res.data);
        return null;
    }
};

const testDuplicateEmail = async () => {
    console.log('\n Testing Duplicate Email...');

    const req = createMockReq('POST', {
        email: TEST_USER.email,
        username: 'differentuser',
        password: TEST_USER.password,
        firstName: TEST_USER.firstName,
        lastName: TEST_USER.lastName
    });

    const res = createMockRes();

    await registerHandler(req, res);

    if (res.statusCode === 409) {
        console.log('Correctly rejected duplicate email:', res.data.error);
    } else {
        console.log('Should have rejected duplicate email:', res.statusCode, res.data);
    }
};

const testLogin = async () => {
    console.log('\n Testing Login...');

    const req = createMockReq('POST', {
        emailOrUsername: TEST_USER.email,
        password: TEST_USER.password
    });
    const res = createMockRes();

    await loginHandler(req, res);

    if (res.statusCode === 200) {
        console.log('Login successful:', res.data.user);
        console.log('Token received:', res.data.token.substring(0, 50) + '...');
        return res.data;
    } else {
        console.log('Login failed:', res.statusCode, res.data);
        return null;
    }
};

const testLoginWithUsername = async () => {
    console.log('\n Testing Login with Username...');

    const req = createMockReq('POST', {
        emailOrUsername: TEST_USER.username,
        password: TEST_USER.password
    });

    const res = createMockRes();

    await loginHandler(req, res);

    if (res.statusCode === 200) {
        console.log('Login with username successful');
    } else {
        console.log('Login with username failed:', res.statusCode, res.data);
    }
};

const testInvalidLogin = async () => {
    console.log('\n Testing Invalid Login...');

    const req = createMockReq('POST', {
        emailOrUsername: TEST_USER.email,
        password: 'wrongpassword'
    });

    const res = createMockRes();

    await loginHandler(req, res);

    if (res.statusCode === 401) {
        console.log('Correctly rejected invalid password:', res.data.error);
    } else {
        console.log('Should have rejected invalid password:', res.statusCode, res.data);
    }
};

const testLogout = async () => {
    console.log('\n Testing Logout...');

    const req = createMockReq('POST');
    const res = createMockRes();

    await logoutHandler(req, res);

    if (res.statusCode === 200) {
        console.log('Logout successful:', res.data.message);
    } else {
        console.log('Logout failed:', res.statusCode, res.data);
    }
};

const testMethodNotAllowed = async () => {
    console.log('\n Testing Method Not Allowed...');

    const req = createMockReq('GET');
    const res = createMockRes();

    await registerHandler(req, res);

    if (res.statusCode === 405) {
        console.log('Correctly rejected GET request:', res.data.error);
    } else {
        console.log('Should have rejected GET request:', res.statusCode, res.data);
    }
};

const main = async () => {
    console.log('Starting Auth Handler Tests...\n');
    console.log('='.repeat(50));

    try {
        await cleanup();

        await testRegister();
        await testDuplicateEmail();
        await testLogin();
        await testLoginWithUsername();
        await testInvalidLogin();
        await testLogout();
        await testMethodNotAllowed();

        console.log('\n' + '='.repeat(50));
        console.log('All tests completed!');

    } catch (error) {
        console.error('\n Test failed:', error);
    } finally {
        await cleanup();
        await prisma.$disconnect();
    }
};

main();
