import pygame


class TextPrint:
    def __init__(self):
        self.x = 10
        self.y = 10
        self.line_height = 30
        self.reset()
        self.font = pygame.font.Font(None, 40)

    def print(self, screen, text_string, color="white"):
        text_bitmap = self.font.render(text_string, True, color)
        screen.blit(text_bitmap, [self.x, self.y])
        self.y += self.line_height

    def reset(self):
        self.x = 10
        self.y = 10
        self.line_height = 30

    def indent(self):
        self.x += 20

    def unindent(self):
        self.x -= 20
