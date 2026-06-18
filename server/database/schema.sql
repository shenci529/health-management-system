-- =============================================
-- 幼儿中小学生健康管理系统数据库架构
-- =============================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student', -- admin, teacher, parent, student, doctor
    real_name VARCHAR(100),
    gender VARCHAR(10),
    age INTEGER,
    phone VARCHAR(20),
    email VARCHAR(100),
    avatar TEXT,
    status INTEGER DEFAULT 1, -- 1: 正常, 0: 禁用
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 年级表
CREATE TABLE IF NOT EXISTS grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL, -- primary, junior, senior
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 班级表
CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grade_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    teacher_id INTEGER, -- 班主任ID
    classroom VARCHAR(100),
    capacity INTEGER DEFAULT 50,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (grade_id) REFERENCES grades(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

-- 学生信息表
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    student_no VARCHAR(50) NOT NULL UNIQUE,
    class_id INTEGER,
    parent_id INTEGER, -- 家长用户ID
    enrollment_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (parent_id) REFERENCES users(id)
);

-- 角色权限表
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT, -- JSON格式存储权限列表
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 学生健康档案表
CREATE TABLE IF NOT EXISTS health_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    record_type VARCHAR(50) NOT NULL, -- physical, vision, dental, vaccine, etc.
    record_date DATE NOT NULL,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    bmi DECIMAL(5,2),
    vision_left DECIMAL(3,1),
    vision_right DECIMAL(3,1),
    dental_status TEXT,
    vaccine_name VARCHAR(100),
    vaccine_date DATE,
    notes TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 过敏史表
CREATE TABLE IF NOT EXISTS allergy_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    allergen VARCHAR(200) NOT NULL,
    reaction TEXT,
    severity VARCHAR(20), -- mild, moderate, severe
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- 既往病史表
CREATE TABLE IF NOT EXISTS medical_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    disease_name VARCHAR(200) NOT NULL,
    diagnosis_date DATE,
    treatment TEXT,
    current_status VARCHAR(50),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- 晨检记录表
CREATE TABLE IF NOT EXISTS morning_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    check_date DATE NOT NULL,
    temperature DECIMAL(4,1),
    status VARCHAR(20) NOT NULL, -- normal, abnormal, absent
    symptoms TEXT,
    notes TEXT,
    checked_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (checked_by) REFERENCES users(id),
    UNIQUE(student_id, check_date)
);

-- 缺勤记录表
CREATE TABLE IF NOT EXISTS absence_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    absence_date DATE NOT NULL,
    reason TEXT,
    type VARCHAR(20), -- sick, personal, etc.
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    approved_by INTEGER,
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- 传染病预警表
CREATE TABLE IF NOT EXISTS disease_warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    class_id INTEGER,
    disease_name VARCHAR(100) NOT NULL,
    warning_level VARCHAR(20) NOT NULL, -- low, medium, high
    description TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, resolved
    reported_by INTEGER,
    resolved_by INTEGER,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (reported_by) REFERENCES users(id),
    FOREIGN KEY (resolved_by) REFERENCES users(id)
);

-- 隔离管理表
CREATE TABLE IF NOT EXISTS isolation_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, completed
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 食谱表
CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_date DATE NOT NULL,
    meal_type VARCHAR(20) NOT NULL, -- breakfast, lunch, dinner, snack
    menu_name VARCHAR(200) NOT NULL,
    ingredients TEXT,
    nutrition_info TEXT,
    allergens TEXT,
    images TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 就餐记录表
CREATE TABLE IF NOT EXISTS dining_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    recipe_id INTEGER,
    dining_date DATE NOT NULL,
    meal_type VARCHAR(20),
    attendance BOOLEAN DEFAULT 1,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

-- 体育活动表
CREATE TABLE IF NOT EXISTS sports_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    activity_date DATE NOT NULL,
    location VARCHAR(200),
    duration INTEGER, -- 分钟
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 活动报名记录表
CREATE TABLE IF NOT EXISTS activity_signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    signup_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'registered', -- registered, cancelled, completed
    FOREIGN KEY (activity_id) REFERENCES sports_activities(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE(activity_id, student_id)
);

-- 健康任务表
CREATE TABLE IF NOT EXISTS health_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    task_type VARCHAR(50), -- exercise, eye_care, etc.
    target_date DATE,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 任务完成记录表
CREATE TABLE IF NOT EXISTS task_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    completed_at DATETIME NOT NULL,
    notes TEXT,
    FOREIGN KEY (task_id) REFERENCES health_tasks(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE(task_id, student_id)
);

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50), -- announcement, warning, health, etc.
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    target_role VARCHAR(50), -- 发送对象角色
    target_class INTEGER, -- 发送对象班级
    is_read BOOLEAN DEFAULT 0,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_class) REFERENCES classes(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 家校沟通消息表
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    read_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- 医疗物资表
CREATE TABLE IF NOT EXISTS medical_supplies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    quantity INTEGER DEFAULT 0,
    unit VARCHAR(50),
    expiry_date DATE,
    location VARCHAR(200),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 健康知识库表
CREATE TABLE IF NOT EXISTS health_resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    category VARCHAR(100), -- exercise, nutrition, safety, etc.
    resource_type VARCHAR(50), -- article, video, image
    images TEXT,
    files TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 异常处理表
CREATE TABLE IF NOT EXISTS abnormal_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    student_name VARCHAR(100),
    student_no VARCHAR(50),
    class_id INTEGER,
    class_name VARCHAR(100),
    abnormal_type VARCHAR(50) NOT NULL, -- fever, allergy, stomach, injury, other
    symptoms TEXT,
    temperature DECIMAL(4,1),
    report_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, referred
    handling_measure VARCHAR(100),
    remarks TEXT,
    handled_by INTEGER,
    handled_at DATETIME,
    reported_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (handled_by) REFERENCES users(id),
    FOREIGN KEY (reported_by) REFERENCES users(id)
);

-- 系统审计日志表
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(100),
    description TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 授权码表（用于项目售卖授权）
CREATE TABLE IF NOT EXISTS licenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    license_code VARCHAR(64) NOT NULL UNIQUE,
    qr_code TEXT,
    customer_name VARCHAR(100),
    customer_phone VARCHAR(20),
    customer_email VARCHAR(100),
    school_name VARCHAR(200),
    status VARCHAR(20) DEFAULT 'active', -- active, used, expired, revoked
    valid_start DATE,
    valid_end DATE,
    max_users INTEGER DEFAULT 100,
    created_by INTEGER,
    sold_at DATETIME,
    activated_at DATETIME,
    activated_by VARCHAR(100),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- =============================================
-- 插入初始数据
-- =============================================

-- 插入默认角色
INSERT OR IGNORE INTO roles (name, description, permissions) VALUES
('admin', '超级管理员', '["all"]'),
('teacher', '班主任/教师', '["student_view","health_record","class_manage"]'),
('parent', '家长', '["child_health_view","message_send"]'),
('student', '学生', '["personal_health","health_task"]'),
('doctor', '校医', '["health_manage","medical_record"]');

-- 插入默认管理员 (密码: admin123)
INSERT OR IGNORE INTO users (username, password, role, real_name, status) VALUES
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin', '超级管理员', 1);

-- 插入默认年级
INSERT OR IGNORE INTO grades (name, type, sort_order) VALUES
('一年级', 'primary', 1),
('二年级', 'primary', 2),
('三年级', 'primary', 3),
('四年级', 'primary', 4),
('五年级', 'primary', 5),
('六年级', 'primary', 6),
('初一', 'junior', 7),
('初二', 'junior', 8),
('初三', 'junior', 9);

-- 插入默认班级
INSERT OR IGNORE INTO classes (grade_id, name, capacity) VALUES
(1, '1班', 50),
(1, '2班', 50),
(2, '1班', 50),
(2, '2班', 50);

-- 插入示例健康知识库
INSERT OR IGNORE INTO health_resources (title, content, category, resource_type) VALUES
('正确的洗手方法', '1. 打湿双手 2. 涂抹肥皂 3. 揉搓20秒 4. 冲洗干净 5. 擦干双手', 'health', 'article'),
('预防近视小贴士', '保持正确坐姿、每45分钟休息、户外活动2小时以上', 'health', 'article'),
('青少年营养指南', '保证蛋白质摄入、多吃蔬菜水果、少喝含糖饮料', 'nutrition', 'article');

-- 插入示例学生用户
INSERT OR IGNORE INTO users (username, password, role, real_name, gender, status) VALUES
('teacher1', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'teacher', '张老师', 'male', 1),
('student1', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student', '张三', 'male', 1),
('student2', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student', '李四', 'female', 1),
('student3', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student', '王五', 'male', 1),
('student4', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student', '赵六', 'male', 1),
('student5', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'student', '孙七', 'female', 1),
('doctor1', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'doctor', '李校医', 'female', 1);

-- 插入示例学生信息
INSERT OR IGNORE INTO students (user_id, student_no, class_id) VALUES
(3, '2024001', 1),
(4, '2024002', 1),
(5, '2024003', 3),
(6, '2024004', 4),
(7, '2024005', 2);

-- 插入示例异常处理记录
INSERT OR IGNORE INTO abnormal_records (student_id, student_name, student_no, class_id, class_name, abnormal_type, symptoms, temperature, report_time, status) VALUES
(1, '张三', '2024001', 1, '一年级1班', 'fever', '体温38.5℃，头晕乏力', 38.5, '2024-01-15 09:30:00', 'pending'),
(2, '李四', '2024002', 1, '一年级1班', 'allergy', '皮肤出现红疹，瘙痒', 36.8, '2024-01-15 10:15:00', 'processing'),
(3, '王五', '2024003', 3, '二年级2班', 'stomach', '腹痛，呕吐一次', 37.2, '2024-01-15 11:00:00', 'pending'),
(4, '赵六', '2024004', 4, '三年级1班', 'injury', '摔倒擦伤膝盖', 36.5, '2024-01-15 14:20:00', 'completed'),
(5, '孙七', '2024005', 2, '四年级1班', 'fever', '体温39.1℃，咳嗽', 39.1, '2024-01-15 15:00:00', 'pending');
