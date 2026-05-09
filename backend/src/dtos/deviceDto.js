function deviceDto(device) {
  return {
    id:          device.id,
    user_id:     device.user_id,
    device_id:   device.device_id,
    device_name: device.device_name,
    is_verified: device.is_verified,
    verified_at: device.verified_at,
    created_at:  device.created_at,
  };
}

module.exports = deviceDto;
