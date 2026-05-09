function userDto(user) {
    return {
        id:         user.id,
        email:      user.email,
        role:       user.role,
        first_name: user.first_name,
        last_name:  user.last_name,
        phone:      user.phone,
        is_active:  user.is_active,
        created_at: user.created_at,
    };
}

module.exports = userDto;