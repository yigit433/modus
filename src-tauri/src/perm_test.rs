use core_graphics::display::{CGPreflightScreenCaptureAccess, CGRequestScreenCaptureAccess};

pub fn test() {
    let _ = unsafe { CGPreflightScreenCaptureAccess() };
    let _ = unsafe { CGRequestScreenCaptureAccess() };
}
