use core_graphics::display::CGMainDisplayID;
use core_graphics::display::CGDisplayCreateImageForRect;
use core_graphics::geometry::{CGPoint, CGRect, CGSize};

pub fn test() {
    let rect = CGRect::new(&CGPoint::new(0.0, 0.0), &CGSize::new(100.0, 100.0));
    let display_id = unsafe { CGMainDisplayID() };
    let cg_image = unsafe { CGDisplayCreateImageForRect(display_id, rect) };
}
